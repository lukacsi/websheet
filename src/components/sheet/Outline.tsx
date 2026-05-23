import { useState, useRef, useMemo, useEffect } from 'react';
import {
  Group, Text, ActionIcon, Checkbox, TextInput, Badge, Paper, Menu, Tooltip, Stack, Select,
} from '@mantine/core';
import {
  IconChevronRight, IconChevronDown, IconPlus, IconTrash, IconArrowRight, IconArrowLeft,
  IconArrowUp, IconArrowDown, IconGripVertical, IconDots, IconExternalLink, IconLink,
  IconUsers, IconFlag, IconMapPin, IconCoin, IconNotes, IconBook,
} from '@tabler/icons-react';
import type { NoteEntry, NoteEntryType } from '@/types/character';
import styles from './Outline.module.css';

const TYPE_CONFIG: Record<NoteEntryType, { icon: typeof IconNotes; color: string; label: string }> = {
  note:     { icon: IconNotes,  color: 'parchment', label: 'Note' },
  npc:      { icon: IconUsers,  color: 'blue',      label: 'NPC' },
  quest:    { icon: IconFlag,   color: 'gold',      label: 'Quest' },
  location: { icon: IconMapPin, color: 'green',     label: 'Location' },
  loot:     { icon: IconCoin,   color: 'yellow',    label: 'Loot' },
  session:  { icon: IconBook,   color: 'grape',     label: 'Session' },
};

const ALL_TYPES: NoteEntryType[] = ['note', 'npc', 'quest', 'location', 'loot', 'session'];
const CONTAINS = 'contains';

type DropZone = 'before' | 'after' | 'child';

interface OutlineProps {
  entries: NoteEntry[];
  onChange: (entries: NoteEntry[]) => void;
  onOpenEntry: (id: string) => void;
}

export function Outline({ entries, onChange, onOpenEntry }: OutlineProps) {
  const [focusId, setFocusId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [dragPath, setDragPath] = useState<string[] | null>(null); // path of entry IDs from root
  const [dropTarget, setDropTarget] = useState<{ path: string[]; zone: DropZone } | null>(null);
  const [addingTo, setAddingTo] = useState<string | null>(null); // entryId or 'root'
  const [addType, setAddType] = useState<NoteEntryType>('note');

  // --- Derived ---

  const byId = useMemo(() => {
    const m = new Map<string, NoteEntry>();
    for (const e of entries) m.set(e.id, e);
    return m;
  }, [entries]);

  /** Entries referenced by SOME 'contains' link are not roots */
  const rootIds = useMemo(() => {
    const childrenSet = new Set<string>();
    for (const e of entries) {
      for (const l of e.links ?? []) {
        if (l.kind === CONTAINS) childrenSet.add(l.targetId);
      }
    }
    return entries.filter((e) => !childrenSet.has(e.id)).map((e) => e.id);
  }, [entries]);

  function getContainsLinks(parentId: string): { targetId: string; idx: number }[] {
    const parent = byId.get(parentId);
    if (!parent) return [];
    const result: { targetId: string; idx: number }[] = [];
    (parent.links ?? []).forEach((l, i) => {
      if (l.kind === CONTAINS) result.push({ targetId: l.targetId, idx: i });
    });
    return result;
  }

  // --- Operations ---

  function ts() { return new Date().toISOString(); }

  function updateEntry(id: string, patch: Partial<NoteEntry>) {
    onChange(entries.map((e) => e.id === id ? { ...e, ...patch, updatedAt: ts() } : e));
  }

  function deleteEntry(id: string) {
    // Remove entry and all links pointing to it
    onChange(entries
      .filter((e) => e.id !== id)
      .map((e) => ({ ...e, links: (e.links ?? []).filter((l) => l.targetId !== id) })));
  }

  function addEntry(type: NoteEntryType, name: string, parentId?: string): string {
    const id = crypto.randomUUID();
    const now = ts();
    const newEntry: NoteEntry = {
      id, type, name: name || 'Unnamed', detail: '',
      createdAt: now, updatedAt: now,
    };
    let next = [...entries, newEntry];
    if (parentId) {
      next = next.map((e) => e.id === parentId
        ? { ...e, links: [...(e.links ?? []), { targetId: id, kind: CONTAINS }], updatedAt: now }
        : e,
      );
    }
    onChange(next);
    return id;
  }

  /** Insert a contains link in parent at a specific link-array index */
  function addContainsAt(parentId: string, childId: string, insertIdx: number): void {
    onChange(entries.map((e) => {
      if (e.id !== parentId) return e;
      const links = [...(e.links ?? [])];
      // Remove if already containing this child (prevents dupes within same parent)
      const existingIdx = links.findIndex((l) => l.kind === CONTAINS && l.targetId === childId);
      if (existingIdx !== -1) {
        links.splice(existingIdx, 1);
        if (existingIdx < insertIdx) insertIdx--;
      }
      links.splice(insertIdx, 0, { targetId: childId, kind: CONTAINS });
      return { ...e, links, updatedAt: ts() };
    }));
  }

  /** Remove a contains link from parent to child */
  function removeContains(parentId: string, childId: string): void {
    onChange(entries.map((e) => {
      if (e.id !== parentId) return e;
      return {
        ...e,
        links: (e.links ?? []).filter((l) => !(l.kind === CONTAINS && l.targetId === childId)),
        updatedAt: ts(),
      };
    }));
  }

  /** Move a contains link: cuts from oldParent, adds to newParent at newIdx */
  function moveContains(oldParentId: string | undefined, newParentId: string | undefined, childId: string, newIdx?: number): void {
    if (!newParentId) {
      // Becoming a root: remove from old parent
      if (oldParentId) removeContains(oldParentId, childId);
      return;
    }
    if (wouldCreateCycle(newParentId, childId)) return;
    onChange(entries.map((e) => {
      // Remove from old parent
      if (oldParentId && e.id === oldParentId) {
        return {
          ...e,
          links: (e.links ?? []).filter((l) => !(l.kind === CONTAINS && l.targetId === childId)),
          updatedAt: ts(),
        };
      }
      // Add to new parent
      if (e.id === newParentId) {
        const links = [...(e.links ?? [])];
        const existingIdx = links.findIndex((l) => l.kind === CONTAINS && l.targetId === childId);
        if (existingIdx !== -1) links.splice(existingIdx, 1);
        const at = newIdx ?? links.length;
        links.splice(at, 0, { targetId: childId, kind: CONTAINS });
        return { ...e, links, updatedAt: ts() };
      }
      return e;
    }));
  }

  function wouldCreateCycle(newParentId: string, childId: string): boolean {
    // True if childId is an ancestor of (or equal to) newParentId in any contains path
    const visit = (nodeId: string, seen: Set<string>): boolean => {
      if (nodeId === childId) return true;
      if (seen.has(nodeId)) return false;
      seen.add(nodeId);
      const node = byId.get(nodeId);
      for (const l of node?.links ?? []) {
        if (l.kind === CONTAINS && visit(l.targetId, seen)) return true;
      }
      return false;
    };
    return visit(newParentId, new Set()) === true || newParentId === childId;
  }

  /** Move within same parent: reorder contains link positions */
  function reorderSibling(parentId: string | undefined, childId: string, direction: -1 | 1): void {
    if (!parentId) {
      // Roots: reorder at top level by reordering entries array.
      const idx = entries.findIndex((e) => e.id === childId);
      if (idx === -1) return;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= entries.length) return;
      const next = [...entries];
      [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
      onChange(next);
      return;
    }
    onChange(entries.map((e) => {
      if (e.id !== parentId) return e;
      const links = [...(e.links ?? [])];
      // Find the Nth 'contains' link that matches child
      const containsIdxs = links.reduce<number[]>((acc, l, i) => {
        if (l.kind === CONTAINS) acc.push(i);
        return acc;
      }, []);
      const childLinkIdx = links.findIndex((l) => l.kind === CONTAINS && l.targetId === childId);
      if (childLinkIdx === -1) return e;
      const siblingPos = containsIdxs.indexOf(childLinkIdx);
      const swapPos = siblingPos + direction;
      if (swapPos < 0 || swapPos >= containsIdxs.length) return e;
      const swapIdx = containsIdxs[swapPos];
      [links[childLinkIdx], links[swapIdx]] = [links[swapIdx], links[childLinkIdx]];
      return { ...e, links, updatedAt: ts() };
    }));
  }

  // --- Tree operations ---

  /** Indent: move under previous sibling as last child */
  function indent(path: string[]): void {
    if (path.length === 0) return;
    const id = path[path.length - 1];
    const parentId = path.length > 1 ? path[path.length - 2] : undefined;
    const siblings = parentId ? getContainsLinks(parentId).map((c) => c.targetId) : rootIds;
    const idx = siblings.findIndex((s) => s === id);
    if (idx <= 0) return;
    const prevSibling = siblings[idx - 1];
    moveContains(parentId, prevSibling, id);
  }

  /** Outdent: move to grandparent's level, after current parent */
  function outdent(path: string[]): void {
    if (path.length < 2) return; // can't outdent a root
    const id = path[path.length - 1];
    const parentId = path[path.length - 2];
    const grandparentId = path.length > 2 ? path[path.length - 3] : undefined;
    moveContains(parentId, grandparentId, id);
  }

  function toggleCollapse(pathKey: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(pathKey)) next.delete(pathKey); else next.add(pathKey);
      return next;
    });
  }

  function handleDrop(target: { path: string[]; zone: DropZone }, dragged: string[]): void {
    if (!dragged || dragged.length === 0) return;
    const draggedId = dragged[dragged.length - 1];
    const draggedParent = dragged.length > 1 ? dragged[dragged.length - 2] : undefined;
    const targetId = target.path[target.path.length - 1];
    const targetParent = target.path.length > 1 ? target.path[target.path.length - 2] : undefined;

    if (target.zone === 'child') {
      if (wouldCreateCycle(targetId, draggedId)) return;
      moveContains(draggedParent, targetId, draggedId);
      setCollapsed((c) => { const n = new Set(c); n.delete(target.path.join('>')); return n; });
    } else {
      // Insert before or after target at targetParent's level
      if (targetParent && wouldCreateCycle(targetParent, draggedId)) return;
      // Compute index in target's parent where to insert
      if (!targetParent) {
        // Root level — skip complex reorder here; fall back to append at root
        if (draggedParent) removeContains(draggedParent, draggedId);
        return;
      }
      const parentEntry = byId.get(targetParent);
      if (!parentEntry) return;
      const containsIdxs = (parentEntry.links ?? []).reduce<number[]>((acc, l, i) => {
        if (l.kind === CONTAINS) acc.push(i);
        return acc;
      }, []);
      const targetLinkIdx = (parentEntry.links ?? []).findIndex((l) => l.kind === CONTAINS && l.targetId === targetId);
      const siblingPos = containsIdxs.indexOf(targetLinkIdx);
      const insertAt = target.zone === 'before' ? siblingPos : siblingPos + 1;
      // Insert at absolute link index = containsIdxs[insertAt] ?? end
      const absIdx = insertAt >= containsIdxs.length ? (parentEntry.links?.length ?? 0) : containsIdxs[insertAt];
      if (draggedParent === targetParent) {
        addContainsAt(targetParent, draggedId, absIdx);
      } else {
        if (draggedParent) removeContains(draggedParent, draggedId);
        addContainsAt(targetParent, draggedId, absIdx);
      }
    }
  }

  // --- Render helpers ---

  function renderRow(entry: NoteEntry, path: string[], depth: number): React.ReactNode {
    const pathKey = path.join('>');
    const childLinks = getContainsLinks(entry.id);
    const hasChildren = childLinks.length > 0;
    const isCollapsed = collapsed.has(pathKey);
    return (
      <OutlineRow
        key={pathKey}
        entry={entry}
        path={path}
        depth={depth}
        hasChildren={hasChildren}
        isCollapsed={isCollapsed}
        isDragging={dragPath?.join('>') === pathKey}
        dropHere={dropTarget?.path.join('>') === pathKey ? dropTarget.zone : null}
        focusId={focusId}
        setFocusId={setFocusId}
        onToggleCollapse={() => toggleCollapse(pathKey)}
        onUpdate={updateEntry}
        onDelete={() => {
          // Remove child link from immediate parent only, OR delete the entry entirely?
          // Choice: if entry has multiple references (multi-parent), unlink from this parent.
          // If this is the only occurrence, delete the entry.
          if (path.length > 1) {
            const parentId = path[path.length - 2];
            const totalRefs = entries.reduce((n, e) =>
              n + (e.links ?? []).filter((l) => l.kind === CONTAINS && l.targetId === entry.id).length, 0);
            if (totalRefs > 1) {
              removeContains(parentId, entry.id);
              return;
            }
          }
          deleteEntry(entry.id);
        }}
        onIndent={() => indent(path)}
        onOutdent={() => outdent(path)}
        onMoveUp={() => {
          const parentId = path.length > 1 ? path[path.length - 2] : undefined;
          reorderSibling(parentId, entry.id, -1);
        }}
        onMoveDown={() => {
          const parentId = path.length > 1 ? path[path.length - 2] : undefined;
          reorderSibling(parentId, entry.id, 1);
        }}
        onAddChild={() => setAddingTo(entry.id)}
        onOpenEntry={() => onOpenEntry(entry.id)}
        onLinkExisting={(existingId) => {
          if (wouldCreateCycle(entry.id, existingId)) return;
          addContainsAt(entry.id, existingId, (byId.get(entry.id)?.links?.length ?? 0));
        }}
        existingEntries={entries}
        onDragStart={() => setDragPath(path)}
        onDragEnd={() => { setDragPath(null); setDropTarget(null); }}
        onDragOverRow={(zone) => setDropTarget({ path, zone })}
        onDropRow={() => {
          if (dragPath && dropTarget) {
            handleDrop(dropTarget, dragPath);
          }
          setDragPath(null);
          setDropTarget(null);
        }}
        onDragLeave={() => {
          if (dropTarget?.path.join('>') === pathKey) setDropTarget(null);
        }}
      >
        {!isCollapsed && childLinks.map((cl) => {
          const child = byId.get(cl.targetId);
          if (!child) return null;
          return renderRow(child, [...path, child.id], depth + 1);
        })}
        {!isCollapsed && addingTo === entry.id && (
          <div style={{ paddingLeft: (depth + 1) * 20 }}>
            <InlineAdd
              type={entry.type}
              onCancel={() => setAddingTo(null)}
              onCommit={(name) => {
                if (name.trim()) addEntry(entry.type, name.trim(), entry.id);
                setAddingTo(null);
              }}
            />
          </div>
        )}
      </OutlineRow>
    );
  }

  return (
    <Stack gap={0}>
      {rootIds.length === 0 && addingTo !== 'root' && (
        <Text c="parchment.6" size="sm" fs="italic" py="md" ta="center">
          Empty outline. Click + below to add.
        </Text>
      )}

      {rootIds.map((id) => {
        const entry = byId.get(id);
        if (!entry) return null;
        return renderRow(entry, [id], 0);
      })}

      {/* Add root */}
      {addingTo === 'root' ? (
        <InlineAdd
          type={addType}
          onType={setAddType}
          onCancel={() => setAddingTo(null)}
          onCommit={(name) => {
            if (name.trim()) addEntry(addType, name.trim());
            setAddingTo(null);
          }}
        />
      ) : (
        <Group gap="xs" mt="xs">
          <ActionIcon variant="light" color="gold" size="sm" onClick={() => setAddingTo('root')} aria-label="Add entry">
            <IconPlus size={14} />
          </ActionIcon>
          <Text size="xs" c="parchment.7">
            Enter = sibling · Tab/Shift+Tab = indent/outdent · Alt+↑↓ = reorder · drag to reparent
          </Text>
        </Group>
      )}
    </Stack>
  );
}

// --- Row ---

interface RowProps {
  entry: NoteEntry;
  path: string[];
  depth: number;
  hasChildren: boolean;
  isCollapsed: boolean;
  isDragging: boolean;
  dropHere: DropZone | null;
  focusId: string | null;
  setFocusId: (id: string | null) => void;
  onToggleCollapse: () => void;
  onUpdate: (id: string, patch: Partial<NoteEntry>) => void;
  onDelete: () => void;
  onIndent: () => void;
  onOutdent: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onAddChild: () => void;
  onOpenEntry: () => void;
  onLinkExisting: (existingId: string) => void;
  existingEntries: NoteEntry[];
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOverRow: (zone: DropZone) => void;
  onDropRow: () => void;
  onDragLeave: () => void;
  children?: React.ReactNode;
}

function OutlineRow(props: RowProps) {
  const {
    entry, path, depth, hasChildren, isCollapsed, isDragging, dropHere, focusId, setFocusId,
    onToggleCollapse, onUpdate, onDelete, onIndent, onOutdent, onMoveUp, onMoveDown,
    onAddChild, onOpenEntry, onLinkExisting, existingEntries,
    onDragStart, onDragEnd, onDragOverRow, onDropRow, onDragLeave,
    children,
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);
  const rowRef = useRef<HTMLDivElement>(null);
  const conf = TYPE_CONFIG[entry.type];
  const Icon = conf.icon;
  const pathKey = path.join('>');

  useEffect(() => {
    if (focusId === pathKey) {
      inputRef.current?.focus();
      inputRef.current?.select();
      setFocusId(null);
    }
  }, [focusId, pathKey, setFocusId]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Tab' && !e.shiftKey) { e.preventDefault(); onIndent(); }
    else if (e.key === 'Tab' && e.shiftKey) { e.preventDefault(); onOutdent(); }
    else if (e.key === 'ArrowUp' && e.altKey) { e.preventDefault(); onMoveUp(); }
    else if (e.key === 'ArrowDown' && e.altKey) { e.preventDefault(); onMoveDown(); }
    else if (e.key === 'Backspace' && entry.name === '') { e.preventDefault(); onDelete(); }
  }

  return (
    <>
      <div
        ref={rowRef}
        className={`${styles.row} ${isDragging ? styles.dragging : ''} ${dropHere ? styles[`drop_${dropHere}`] : ''}`}
        style={{ paddingLeft: depth * 20 }}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = 'move';
          const rect = rowRef.current?.getBoundingClientRect();
          if (!rect) return;
          const y = e.clientY - rect.top;
          const third = rect.height / 3;
          const zone: DropZone = y < third ? 'before' : y > third * 2 ? 'after' : 'child';
          onDragOverRow(zone);
        }}
        onDrop={(e) => { e.preventDefault(); onDropRow(); }}
        onDragLeave={onDragLeave}
      >
        {depth > 0 && (
          <div className={styles.guides}>
            {Array.from({ length: depth }).map((_, i) => (
              <div key={i} className={styles.guideLine} style={{ left: i * 20 + 9 }} />
            ))}
          </div>
        )}

        <Group gap={4} wrap="nowrap" style={{ flex: 1, minHeight: 30, alignItems: 'center' }}>
          <div
            draggable
            onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', entry.id); onDragStart(); }}
            onDragEnd={onDragEnd}
            className={styles.dragHandle}
            aria-label="Drag to reparent"
          >
            <IconGripVertical size={12} />
          </div>

          <ActionIcon
            variant="subtle" size="xs" c="parchment.6"
            onClick={onToggleCollapse}
            style={{ visibility: hasChildren ? 'visible' : 'hidden', width: 16 }}
            aria-label={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <IconChevronRight size={12} /> : <IconChevronDown size={12} />}
          </ActionIcon>

          <Menu position="bottom-start" withinPortal>
            <Menu.Target>
              <Tooltip label={conf.label} openDelay={400}>
                <ActionIcon variant="light" size="xs" color={conf.color} aria-label={`Type: ${conf.label}`}>
                  <Icon size={12} />
                </ActionIcon>
              </Tooltip>
            </Menu.Target>
            <Menu.Dropdown>
              {ALL_TYPES.map((t) => {
                const c = TYPE_CONFIG[t];
                return (
                  <Menu.Item key={t} leftSection={<c.icon size={14} />}
                    onClick={() => onUpdate(entry.id, { type: t })}
                    style={t === entry.type ? { backgroundColor: 'var(--mantine-color-dark-5)' } : undefined}
                  >
                    {c.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>

          {entry.type === 'quest' && (
            <Checkbox
              size="xs"
              checked={entry.checked ?? false}
              onChange={(e) => onUpdate(entry.id, { checked: e.currentTarget.checked })}
            />
          )}

          <TextInput
            ref={inputRef}
            value={entry.name}
            onChange={(e) => onUpdate(entry.id, { name: e.currentTarget.value })}
            onKeyDown={handleKeyDown}
            onDoubleClick={onOpenEntry}
            size="xs"
            variant="unstyled"
            placeholder="..."
            style={{
              flex: 1,
              textDecoration: entry.checked ? 'line-through' : undefined,
              opacity: entry.checked ? 0.5 : 1,
            }}
            styles={{ input: { fontSize: 13, minHeight: 24 } }}
          />

          {(entry.tags ?? []).slice(0, 2).map((t) => (
            <Badge key={t} size="xs" variant="light" color="parchment">{t}</Badge>
          ))}
          {(entry.links ?? []).filter((l) => l.kind !== CONTAINS).length > 0 && (
            <Badge size="xs" variant="light" color="gold">↔{(entry.links ?? []).filter((l) => l.kind !== CONTAINS).length}</Badge>
          )}

          <div className={styles.actions}>
            <Tooltip label="Open details" openDelay={300}>
              <ActionIcon variant="subtle" size="xs" color={conf.color} onClick={onOpenEntry}>
                <IconExternalLink size={12} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Add child" openDelay={300}>
              <ActionIcon variant="subtle" size="xs" c="gold.6" onClick={onAddChild}>
                <IconPlus size={12} />
              </ActionIcon>
            </Tooltip>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Tooltip label="Link existing entry" openDelay={300}>
                  <ActionIcon variant="subtle" size="xs" c="parchment.7">
                    <IconLink size={12} />
                  </ActionIcon>
                </Tooltip>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Nest existing entry here</Menu.Label>
                <div style={{ padding: 6 }}>
                  <Select
                    placeholder="Search entries..."
                    data={existingEntries
                      .filter((e) => e.id !== entry.id)
                      .map((e) => ({ value: e.id, label: `${e.name} [${TYPE_CONFIG[e.type].label}]` }))}
                    searchable
                    clearable
                    onChange={(v) => v && onLinkExisting(v)}
                    size="xs"
                  />
                </div>
              </Menu.Dropdown>
            </Menu>
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon variant="subtle" size="xs" c="parchment.7">
                  <IconDots size={12} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item leftSection={<IconArrowUp size={12} />} onClick={onMoveUp}>Move up</Menu.Item>
                <Menu.Item leftSection={<IconArrowDown size={12} />} onClick={onMoveDown}>Move down</Menu.Item>
                <Menu.Item leftSection={<IconArrowRight size={12} />} onClick={onIndent}>Indent</Menu.Item>
                <Menu.Item leftSection={<IconArrowLeft size={12} />} onClick={onOutdent}>Outdent</Menu.Item>
                <Menu.Divider />
                <Menu.Item leftSection={<IconTrash size={12} />} color="red" onClick={onDelete}>Remove</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </div>
        </Group>
      </div>

      {children}
    </>
  );
}

// --- Inline add ---

function InlineAdd({ type, onType, onCancel, onCommit }: {
  type: NoteEntryType;
  onType?: (t: NoteEntryType) => void;
  onCancel: () => void;
  onCommit: (name: string) => void;
}) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  const conf = TYPE_CONFIG[type];
  const Icon = conf.icon;
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <Paper p={4} style={{ backgroundColor: 'rgba(191, 157, 100, 0.06)', borderRadius: 4, margin: '2px 0' }}>
      <Group gap={4} wrap="nowrap">
        {onType ? (
          <Menu position="bottom-start" withinPortal>
            <Menu.Target>
              <ActionIcon variant="light" size="xs" color={conf.color}><Icon size={12} /></ActionIcon>
            </Menu.Target>
            <Menu.Dropdown>
              {ALL_TYPES.map((t) => {
                const c = TYPE_CONFIG[t];
                return (
                  <Menu.Item key={t} leftSection={<c.icon size={14} />} onClick={() => onType(t)}>
                    {c.label}
                  </Menu.Item>
                );
              })}
            </Menu.Dropdown>
          </Menu>
        ) : (
          <ActionIcon variant="light" size="xs" color={conf.color}><Icon size={12} /></ActionIcon>
        )}
        <TextInput
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') { e.preventDefault(); onCommit(value); }
            else if (e.key === 'Escape') { e.preventDefault(); onCancel(); }
          }}
          onBlur={() => { if (value.trim()) onCommit(value); else onCancel(); }}
          placeholder={`New ${conf.label.toLowerCase()} name...`}
          size="xs"
          variant="unstyled"
          style={{ flex: 1 }}
          styles={{ input: { fontSize: 13, minHeight: 24 } }}
        />
      </Group>
    </Paper>
  );
}

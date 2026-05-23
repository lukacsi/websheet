import { useState, useRef, useMemo } from 'react';
import {
  SegmentedControl, Text, Group, TextInput, ActionIcon, Stack, Paper,
  CloseButton, UnstyledButton, Checkbox, Badge, Menu, Textarea, Divider,
  Collapse,
} from '@mantine/core';
import {
  IconPlus, IconSearch, IconUsers, IconFlag, IconCoin, IconNotes,
  IconNetwork, IconMapPin, IconBook, IconListDetails, IconChevronDown,
  IconChevronRight, IconPin,
} from '@tabler/icons-react';
import type {
  CharacterNotes, NoteEntry, NoteEntryType,
} from '@/types/character';
import { surfaceStyle } from '@/theme/styles';
import { Outline } from './Outline';
import { EntryDrawer } from './EntryDrawer';
import { normalizeNotes, findEntry } from '@/utils/notes-migration';

const TYPE_CONFIG: Record<NoteEntryType, { icon: typeof IconNotes; color: string; label: string; plural: string }> = {
  note:     { icon: IconNotes,   color: 'parchment', label: 'Note',     plural: 'Notes' },
  npc:      { icon: IconUsers,   color: 'blue',      label: 'NPC',      plural: 'NPCs' },
  quest:    { icon: IconFlag,    color: 'gold',      label: 'Quest',    plural: 'Quests' },
  location: { icon: IconMapPin,  color: 'green',     label: 'Location', plural: 'Places' },
  loot:     { icon: IconCoin,    color: 'yellow',    label: 'Loot',     plural: 'Loot' },
  session:  { icon: IconBook,    color: 'grape',     label: 'Session',  plural: 'Sessions' },
};

const ALL_TYPES: NoteEntryType[] = ['npc', 'quest', 'location', 'loot', 'note', 'session'];

interface Props {
  notes: string | CharacterNotes;
  onChange: (notes: CharacterNotes) => void;
}

type View = 'list' | 'outline';

export function NotesSection({ notes, onChange }: Props) {
  const data = useMemo(() => normalizeNotes(notes), [notes]);
  const [view, setView] = useState<View>('list');
  const [search, setSearch] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<NoteEntryType>>(new Set(ALL_TYPES));
  const [openEntryId, setOpenEntryId] = useState<string | null>(null);
  const [quickType, setQuickType] = useState<NoteEntryType>('session');
  const [quickText, setQuickText] = useState('');
  const [generalOpen, setGeneralOpen] = useState(false);
  const quickInputRef = useRef<HTMLInputElement>(null);

  // --- Entry operations ---

  function createEntry(type: NoteEntryType, name: string, detail = ''): NoteEntry {
    const ts = new Date().toISOString();
    const entry: NoteEntry = {
      id: crypto.randomUUID(),
      type,
      name: name || 'Unnamed',
      detail,
      createdAt: ts,
      updatedAt: ts,
    };
    onChange({ ...data, entries: [...data.entries, entry] });
    return entry;
  }

  function updateEntry(updated: NoteEntry) {
    onChange({
      ...data,
      entries: data.entries.map((e) => e.id === updated.id ? updated : e),
    });
  }

  function deleteEntry(id: string) {
    // Remove entry and all references to it (contains + semantic links)
    onChange({
      ...data,
      entries: data.entries
        .filter((e) => e.id !== id)
        .map((e) => ({ ...e, links: (e.links ?? []).filter((l) => l.targetId !== id) })),
    });
    if (openEntryId === id) setOpenEntryId(null);
  }

  function toggleCheck(id: string, checked: boolean) {
    onChange({
      ...data,
      entries: data.entries.map((e) =>
        e.id === id ? { ...e, checked, updatedAt: new Date().toISOString() } : e,
      ),
    });
  }

  // --- Quick add ---

  function handleQuickAdd() {
    const text = quickText.trim();
    if (!text) return;
    if (quickType === 'session') {
      // Session: text is the body, name is first line
      const firstLine = text.split('\n')[0].slice(0, 60);
      createEntry('session', firstLine || 'Session note', text);
    } else {
      // Other types: text is the name, detail empty — open drawer for editing
      const entry = createEntry(quickType, text);
      setOpenEntryId(entry.id);
    }
    setQuickText('');
    quickInputRef.current?.focus();
  }

  // --- Filter/search ---

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.entries
      .filter((e) => activeTypes.has(e.type))
      .filter((e) => {
        if (!q) return true;
        return e.name.toLowerCase().includes(q) ||
          e.detail.toLowerCase().includes(q) ||
          (e.tags ?? []).some((t) => t.toLowerCase().includes(q));
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data.entries, activeTypes, search]);

  function toggleType(type: NoteEntryType) {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }

  const openEntry = openEntryId ? findEntry(data.entries, openEntryId) ?? null : null;

  // --- Type count badges ---
  const typeCounts = useMemo(() => {
    const counts = new Map<NoteEntryType, number>();
    for (const e of data.entries) counts.set(e.type, (counts.get(e.type) ?? 0) + 1);
    return counts;
  }, [data.entries]);

  return (
    <>
      <Stack gap="sm">
        {/* Quick-capture bar */}
        <Paper p="xs" style={surfaceStyle}>
          <Group gap="xs">
            <Menu position="bottom-start" withinPortal>
              <Menu.Target>
                <UnstyledButton>
                  <Badge
                    size="md"
                    variant="light"
                    color={TYPE_CONFIG[quickType].color}
                    leftSection={(() => {
                      const Icon = TYPE_CONFIG[quickType].icon;
                      return <Icon size={12} />;
                    })()}
                    rightSection={<IconChevronDown size={10} />}
                    style={{ cursor: 'pointer' }}
                  >
                    {TYPE_CONFIG[quickType].label}
                  </Badge>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                {ALL_TYPES.map((t) => {
                  const c = TYPE_CONFIG[t];
                  const Icon = c.icon;
                  return (
                    <Menu.Item key={t} leftSection={<Icon size={14} />} onClick={() => setQuickType(t)}>
                      {c.label}
                    </Menu.Item>
                  );
                })}
              </Menu.Dropdown>
            </Menu>
            <TextInput
              ref={quickInputRef}
              placeholder={
                quickType === 'session'
                  ? 'What happened? (Enter to log)'
                  : `New ${TYPE_CONFIG[quickType].label.toLowerCase()} name...`
              }
              value={quickText}
              onChange={(e) => setQuickText(e.currentTarget.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
              style={{ flex: 1 }}
              size="sm"
            />
            <ActionIcon
              onClick={handleQuickAdd}
              variant="light"
              color={TYPE_CONFIG[quickType].color}
              size="lg"
              aria-label="Add entry"
            >
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </Paper>

        {/* View toggle + search */}
        <Group gap="xs" wrap="nowrap">
          <SegmentedControl
            size="xs"
            value={view}
            onChange={(v) => setView(v as View)}
            data={[
              { label: (<Group gap={4} wrap="nowrap"><IconListDetails size={12} /><Text size="xs">List</Text></Group>) as unknown as string, value: 'list' },
              { label: (<Group gap={4} wrap="nowrap"><IconNetwork size={12} /><Text size="xs">Outline</Text></Group>) as unknown as string, value: 'outline' },
            ]}
          />
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={12} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            size="xs"
            style={{ flex: 1 }}
          />
        </Group>

        {/* Type filter chips */}
        <Group gap={4}>
          {ALL_TYPES.map((t) => {
            const c = TYPE_CONFIG[t];
            const Icon = c.icon;
            const active = activeTypes.has(t);
            const count = typeCounts.get(t) ?? 0;
            return (
              <UnstyledButton key={t} onClick={() => toggleType(t)}>
                <Badge
                  size="sm"
                  variant={active ? 'light' : 'outline'}
                  color={active ? c.color : 'gray'}
                  leftSection={<Icon size={11} />}
                  style={{ opacity: active ? 1 : 0.5, cursor: 'pointer' }}
                >
                  {c.plural} {count > 0 && `(${count})`}
                </Badge>
              </UnstyledButton>
            );
          })}
        </Group>

        {/* Active view */}
        {view === 'list' && (
          <Stack gap={4}>
            {filtered.length === 0 && (
              <Text c="parchment.6" size="sm" fs="italic" py="md" ta="center">
                {search || activeTypes.size < ALL_TYPES.length
                  ? 'No entries match the filter.'
                  : 'No entries yet. Quick-add above or switch to Mindmap.'}
              </Text>
            )}
            {filtered.map((e) => (
              <EntryCard
                key={e.id}
                entry={e}
                onOpen={setOpenEntryId}
                onDelete={deleteEntry}
                onToggleCheck={toggleCheck}
              />
            ))}
          </Stack>
        )}

        {view === 'outline' && (
          <Outline
            entries={data.entries}
            onChange={(entries) => onChange({ ...data, entries })}
            onOpenEntry={setOpenEntryId}
          />
        )}

        {/* General scratchpad — collapsible */}
        <Paper p="xs" style={surfaceStyle}>
          <UnstyledButton onClick={() => setGeneralOpen((v) => !v)} style={{ width: '100%' }}>
            <Group gap="xs">
              {generalOpen ? <IconChevronDown size={12} /> : <IconChevronRight size={12} />}
              <IconPin size={12} style={{ color: 'var(--mantine-color-parchment-6)' }} />
              <Text size="sm" fw={500} c="parchment.5">General</Text>
              {!generalOpen && data.general.trim() && (
                <Text size="xs" c="parchment.7" truncate style={{ flex: 1 }}>
                  {data.general.split('\n')[0]}
                </Text>
              )}
            </Group>
          </UnstyledButton>
          <Collapse in={generalOpen}>
            <Divider my="xs" />
            <Textarea
              value={data.general}
              onChange={(e) => onChange({ ...data, general: e.currentTarget.value })}
              placeholder="Character-level scratchpad: house rules, reminders, long-form thoughts..."
              minRows={3}
              autosize
              maxRows={15}
              variant="unstyled"
            />
          </Collapse>
        </Paper>
      </Stack>

      <EntryDrawer
        entry={openEntry}
        allEntries={data.entries}
        onChange={updateEntry}
        onDelete={deleteEntry}
        onClose={() => setOpenEntryId(null)}
        onOpenEntry={(id) => setOpenEntryId(id)}
      />
    </>
  );
}

// --- Subcomponents ---

function EntryCard({ entry, onOpen, onDelete, onToggleCheck }: {
  entry: NoteEntry;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCheck: (id: string, checked: boolean) => void;
}) {
  const conf = TYPE_CONFIG[entry.type];
  const Icon = conf.icon;
  const isSession = entry.type === 'session';
  const date = new Date(entry.updatedAt);
  const timeStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  return (
    <Paper p="xs" style={surfaceStyle}>
      <Group gap="xs" wrap="nowrap" align="flex-start">
        {entry.type === 'quest' && (
          <Checkbox
            size="xs"
            checked={entry.checked ?? false}
            onChange={(e) => { e.stopPropagation(); onToggleCheck(entry.id, e.currentTarget.checked); }}
            onClick={(e) => e.stopPropagation()}
          />
        )}
        <Icon size={14} style={{ color: `var(--mantine-color-${conf.color}-5)`, flexShrink: 0, marginTop: 3 }} />
        <UnstyledButton onClick={() => onOpen(entry.id)} style={{ flex: 1, minWidth: 0 }}>
          <div>
            <Group gap={4} wrap="nowrap">
              <Text
                size="sm"
                fw={600}
                truncate
                style={{
                  textDecoration: entry.checked ? 'line-through' : undefined,
                  opacity: entry.checked ? 0.5 : 1,
                }}
              >
                {entry.name}
              </Text>
              {(entry.tags ?? []).slice(0, 3).map((t) => (
                <Badge key={t} size="xs" variant="light" color="parchment">{t}</Badge>
              ))}
            </Group>
            {entry.detail.trim() && (
              <Text size="xs" c="parchment.6" lineClamp={isSession ? 3 : 1} style={{ whiteSpace: 'pre-wrap' }}>
                {entry.detail}
              </Text>
            )}
            <Group gap={8} mt={2}>
              <Text size="xs" c="parchment.7">{timeStr}</Text>
              {(entry.links ?? []).length > 0 && (
                <Text size="xs" c="gold.6">↔ {(entry.links ?? []).length}</Text>
              )}
            </Group>
          </div>
        </UnstyledButton>
        <CloseButton size="xs" onClick={(e) => { e.stopPropagation(); onDelete(entry.id); }} />
      </Group>
    </Paper>
  );
}


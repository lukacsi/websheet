import { useState, useEffect } from 'react';
import {
  Drawer, Stack, Group, TextInput, Textarea, Text, ActionIcon, Badge,
  Select, Checkbox, Divider, UnstyledButton, Paper, Tooltip,
} from '@mantine/core';
import {
  IconTrash, IconPlus, IconUsers, IconFlag, IconMapPin, IconCoin, IconNotes, IconBook,
} from '@tabler/icons-react';
import type { NoteEntry, NoteEntryType } from '@/types/character';
import { drawerStyles, surfaceStyle } from '@/theme/styles';

const TYPE_CONFIG: Record<NoteEntryType, { icon: typeof IconNotes; color: string; label: string }> = {
  note: { icon: IconNotes, color: 'parchment', label: 'Note' },
  npc: { icon: IconUsers, color: 'blue', label: 'NPC' },
  quest: { icon: IconFlag, color: 'gold', label: 'Quest' },
  location: { icon: IconMapPin, color: 'green', label: 'Location' },
  loot: { icon: IconCoin, color: 'yellow', label: 'Loot' },
  session: { icon: IconBook, color: 'grape', label: 'Session' },
};

interface EntryDrawerProps {
  entry: NoteEntry | null;
  allEntries: NoteEntry[];
  onChange: (entry: NoteEntry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
  onOpenEntry: (id: string) => void; // open another entry in the same drawer (navigation)
}

export function EntryDrawer({ entry, allEntries, onChange, onDelete, onClose, onOpenEntry }: EntryDrawerProps) {
  const [draft, setDraft] = useState<NoteEntry | null>(entry);

  // Sync draft when entry prop changes
  useEffect(() => { setDraft(entry); }, [entry?.id]);

  if (!draft || !entry) return <Drawer opened={false} onClose={onClose} position="right" size="md" />;

  const conf = TYPE_CONFIG[draft.type];
  const Icon = conf.icon;

  function commit(updates: Partial<NoteEntry>) {
    if (!draft) return;
    const next = { ...draft, ...updates, updatedAt: new Date().toISOString() };
    setDraft(next);
    onChange(next);
  }

  function addLink(targetId: string) {
    const links = draft!.links ?? [];
    if (links.some((l) => l.targetId === targetId)) return;
    commit({ links: [...links, { targetId }] });
  }

  function removeLink(targetId: string) {
    commit({ links: (draft!.links ?? []).filter((l) => l.targetId !== targetId) });
  }

  function updateLinkKind(targetId: string, kind: string) {
    commit({
      links: (draft!.links ?? []).map((l) =>
        l.targetId === targetId ? { ...l, kind } : l,
      ),
    });
  }

  // Backrefs: other entries whose semantic (non-contains) links point to this one
  const backrefs = allEntries.filter((e) =>
    e.id !== draft.id && (e.links ?? []).some((l) => l.targetId === draft.id && l.kind !== 'contains')
  );
  // Parents: entries whose 'contains' link points to this one (outline ancestry)
  const parents = allEntries.filter((e) =>
    e.id !== draft.id && (e.links ?? []).some((l) => l.targetId === draft.id && l.kind === 'contains')
  );

  // Link picker data — all other entries
  const linkablePicker = allEntries
    .filter((e) => e.id !== draft.id)
    .map((e) => ({
      value: e.id,
      label: `${e.name} [${TYPE_CONFIG[e.type].label}]`,
    }));

  return (
    <Drawer
      opened={!!entry}
      onClose={onClose}
      position="right"
      size="md"
      withCloseButton={false}
      styles={drawerStyles}
    >
      {/* Header */}
      <Group justify="space-between" px="md" py="sm" style={{ borderBottom: '1px solid var(--mantine-color-dark-5)', flexShrink: 0 }}>
        <Group gap="xs">
          <Icon size={18} style={{ color: `var(--mantine-color-${conf.color}-5)` }} />
          <Badge size="sm" variant="light" color={conf.color}>{conf.label}</Badge>
        </Group>
        <Tooltip label="Delete entry">
          <ActionIcon variant="subtle" color="red" onClick={() => { onDelete(draft.id); onClose(); }}>
            <IconTrash size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Stack gap="md" p="md">
        {/* Name */}
        <TextInput
          label="Name"
          value={draft.name}
          onChange={(e) => commit({ name: e.currentTarget.value })}
          size="sm"
          styles={{ input: { fontWeight: 600, fontSize: 16 } }}
        />

        {/* Type */}
        <Select
          label="Type"
          data={(Object.keys(TYPE_CONFIG) as NoteEntryType[]).map((t) => ({ value: t, label: TYPE_CONFIG[t].label }))}
          value={draft.type}
          onChange={(v) => v && commit({ type: v as NoteEntryType })}
          size="sm"
        />

        {/* Quest-specific checkbox */}
        {draft.type === 'quest' && (
          <Checkbox
            label="Completed"
            checked={draft.checked ?? false}
            onChange={(e) => commit({ checked: e.currentTarget.checked })}
            size="sm"
          />
        )}

        {/* Detail */}
        <Textarea
          label="Details"
          value={draft.detail}
          onChange={(e) => commit({ detail: e.currentTarget.value })}
          placeholder="Description, backstory, notes..."
          minRows={4}
          autosize
          maxRows={20}
          size="sm"
        />

        {/* Tags */}
        <div>
          <Text size="sm" fw={500} mb={4}>Tags</Text>
          <Group gap={4} mb="xs">
            {(draft.tags ?? []).map((tag) => (
              <Badge
                key={tag}
                size="sm"
                variant="light"
                rightSection={
                  <ActionIcon size="xs" variant="transparent" onClick={() => commit({ tags: (draft.tags ?? []).filter((t) => t !== tag) })}>
                    <IconTrash size={10} />
                  </ActionIcon>
                }
              >
                {tag}
              </Badge>
            ))}
          </Group>
          <TextInput
            placeholder="Add tag — press Enter"
            size="xs"
            onKeyDown={(e) => {
              const input = e.currentTarget;
              if (e.key === 'Enter' && input.value.trim()) {
                const tag = input.value.trim();
                const tags = draft.tags ?? [];
                if (!tags.includes(tag)) commit({ tags: [...tags, tag] });
                input.value = '';
              }
            }}
          />
        </div>

        <Divider />

        {/* Relationships */}
        <div>
          <Text size="sm" fw={500} mb="xs">Linked to</Text>
          <Stack gap={4}>
            {(draft.links ?? []).filter((l) => l.kind !== 'contains').map((link) => {
              const target = allEntries.find((e) => e.id === link.targetId);
              if (!target) return null;
              const targetConf = TYPE_CONFIG[target.type];
              const TIcon = targetConf.icon;
              return (
                <Paper key={link.targetId} p="xs" style={surfaceStyle}>
                  <Group justify="space-between" wrap="nowrap" gap="xs">
                    <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                      <TIcon size={14} style={{ color: `var(--mantine-color-${targetConf.color}-5)`, flexShrink: 0 }} />
                      <UnstyledButton onClick={() => onOpenEntry(target.id)} style={{ minWidth: 0, flex: 1 }}>
                        <Text size="sm" truncate fw={500}>{target.name}</Text>
                      </UnstyledButton>
                    </Group>
                    <TextInput
                      value={link.kind ?? ''}
                      onChange={(e) => updateLinkKind(link.targetId, e.currentTarget.value)}
                      placeholder="relation..."
                      size="xs"
                      style={{ width: 110, flexShrink: 0 }}
                      styles={{ input: { fontSize: 11 } }}
                    />
                    <ActionIcon variant="subtle" size="xs" color="red" onClick={() => removeLink(link.targetId)}>
                      <IconTrash size={12} />
                    </ActionIcon>
                  </Group>
                </Paper>
              );
            })}
            <Select
              placeholder="+ Link to another entry..."
              data={linkablePicker}
              searchable
              clearable
              value={null}
              onChange={(v) => v && addLink(v)}
              size="xs"
              leftSection={<IconPlus size={12} />}
            />
          </Stack>
        </div>

        {/* Backrefs */}
        {parents.length > 0 && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} mb="xs" c="parchment.6">Nested under</Text>
              <Stack gap={4}>
                {parents.map((p) => {
                  const pConf = TYPE_CONFIG[p.type];
                  const PIcon = pConf.icon;
                  return (
                    <UnstyledButton key={p.id} onClick={() => onOpenEntry(p.id)}>
                      <Paper p="xs" style={surfaceStyle}>
                        <Group gap="xs" wrap="nowrap">
                          <PIcon size={14} style={{ color: `var(--mantine-color-${pConf.color}-5)` }} />
                          <Text size="sm" truncate fw={500} style={{ flex: 1 }}>{p.name}</Text>
                        </Group>
                      </Paper>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </div>
          </>
        )}

        {backrefs.length > 0 && (
          <>
            <Divider />
            <div>
              <Text size="sm" fw={500} mb="xs" c="parchment.6">Referenced by</Text>
              <Stack gap={4}>
                {backrefs.map((ref) => {
                  const rConf = TYPE_CONFIG[ref.type];
                  const RIcon = rConf.icon;
                  const relationKind = (ref.links ?? []).find((l) => l.targetId === draft.id)?.kind;
                  return (
                    <UnstyledButton key={ref.id} onClick={() => onOpenEntry(ref.id)}>
                      <Paper p="xs" style={surfaceStyle}>
                        <Group gap="xs" wrap="nowrap">
                          <RIcon size={14} style={{ color: `var(--mantine-color-${rConf.color}-5)` }} />
                          <Text size="sm" truncate fw={500} style={{ flex: 1 }}>{ref.name}</Text>
                          {relationKind && <Badge size="xs" variant="light">{relationKind}</Badge>}
                        </Group>
                      </Paper>
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </div>
          </>
        )}
      </Stack>
    </Drawer>
  );
}

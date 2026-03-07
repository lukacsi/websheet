import { useState } from 'react';
import { Stack, Table, Checkbox, ActionIcon, Select, Group, Text, Badge } from '@mantine/core';
import type { CharacterSpell } from '@/types';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useSpells } from '@/hooks/useSpells';

const SCHOOL_NAMES: Record<string, string> = {
  A: 'Abj', C: 'Conj', D: 'Div', E: 'Ench',
  V: 'Evoc', I: 'Ill', N: 'Necro', T: 'Trans',
};

interface Props {
  spells: CharacterSpell[];
  onChange: (spells: CharacterSpell[]) => void;
}

export function SpellsSection({ spells, onChange }: Props) {
  const { spells: allSpells, loading } = useSpells();
  const [search, setSearch] = useState<string | null>(null);

  const existingIds = new Set(spells.map((s) => s.spellId));

  const selectData = allSpells
    .filter((s) => !existingIds.has(s.id))
    .map((s) => ({
      value: s.id,
      label: `${s.name} (Lvl ${s.level}, ${SCHOOL_NAMES[s.school] ?? s.school})`,
    }));

  function addSpell(spellId: string | null) {
    if (!spellId) return;
    const spell = allSpells.find((s) => s.id === spellId);
    if (!spell) return;
    onChange([...spells, {
      spellId: spell.id,
      name: spell.name,
      prepared: false,
    }]);
    setSearch(null);
  }

  function removeSpell(index: number) {
    onChange(spells.filter((_, i) => i !== index));
  }

  function togglePrepared(index: number) {
    const next = spells.map((s, i) =>
      i === index ? { ...s, prepared: !s.prepared } : s
    );
    onChange(next);
  }

  // Group spells by level
  const grouped = new Map<number, (CharacterSpell & { idx: number })[]>();
  spells.forEach((s, idx) => {
    const spell = allSpells.find((a) => a.id === s.spellId);
    const level = spell?.level ?? 0;
    const list = grouped.get(level) ?? [];
    list.push({ ...s, idx });
    grouped.set(level, list);
  });
  const sortedLevels = [...grouped.keys()].sort((a, b) => a - b);

  return (
    <Stack gap="sm">
      <Select
        placeholder="Search and add a spell..."
        data={selectData}
        value={search}
        onChange={addSpell}
        searchable
        clearable
        nothingFoundMessage={loading ? 'Loading spells...' : 'No spells found'}
        size="sm"
        limit={30}
      />

      {sortedLevels.map((level) => {
        const group = grouped.get(level)!;
        return (
          <div key={level}>
            <Text size="xs" fw={600} c="dimmed" tt="uppercase" mb={2}>
              {level === 0 ? 'Cantrips' : `Level ${level}`}
            </Text>
            <Table withRowBorders={false} verticalSpacing={2} fz="sm">
              <Table.Tbody>
                {group.map(({ idx, spellId, name, prepared, alwaysPrepared }) => {
                  const spellData = allSpells.find((s) => s.id === spellId);
                  return (
                    <Table.Tr key={idx}>
                      <Table.Td w={30}>
                        <Checkbox
                          size="xs"
                          checked={prepared || alwaysPrepared}
                          disabled={!!alwaysPrepared}
                          onChange={() => togglePrepared(idx)}
                          title="Prepared"
                        />
                      </Table.Td>
                      <Table.Td>
                        <WikiLink
                          tagType="spell"
                          name={name}
                          source={spellData?.source}
                        />
                      </Table.Td>
                      <Table.Td w={60}>
                        {spellData && (
                          <Badge size="xs" variant="light" color="gray" style={{ minWidth: 50, textAlign: 'center' }}>
                            {SCHOOL_NAMES[spellData.school] ?? spellData.school}
                          </Badge>
                        )}
                      </Table.Td>
                      <Table.Td w={70}>
                        <Group gap={4} wrap="nowrap">
                          {spellData?.components?.v && <Text span size="xs" c="dimmed">V</Text>}
                          {spellData?.components?.s && <Text span size="xs" c="dimmed">S</Text>}
                          {spellData?.components?.m && <Text span size="xs" c="dimmed">M</Text>}
                        </Group>
                      </Table.Td>
                      <Table.Td w={50}>
                        <Group gap={4} wrap="nowrap">
                          {spellData?.isRitual && <Badge size="xs" variant="outline" color="teal">R</Badge>}
                          {spellData?.duration?.[0]?.concentration && (
                            <Badge size="xs" variant="outline" color="yellow">C</Badge>
                          )}
                        </Group>
                      </Table.Td>
                      <Table.Td w={30}>
                        <ActionIcon
                          size="xs"
                          variant="subtle"
                          color="red"
                          onClick={() => removeSpell(idx)}
                        >
                          &times;
                        </ActionIcon>
                      </Table.Td>
                    </Table.Tr>
                  );
                })}
              </Table.Tbody>
            </Table>
          </div>
        );
      })}

      {spells.length === 0 && (
        <Text size="sm" c="dimmed" fs="italic">No spells added yet</Text>
      )}
    </Stack>
  );
}

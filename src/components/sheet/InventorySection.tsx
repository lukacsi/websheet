import { useState } from 'react';
import { Stack, Table, TextInput, NumberInput, Checkbox, Group, Button, Select, Text } from '@mantine/core';
import type { CharacterItem } from '@/types';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useItems } from '@/hooks/useItems';
import { numOrDefault } from '@/utils/form-helpers';
import { centeredInputStyles } from '@/theme/styles';
import { RemoveButton } from './RemoveButton';

interface Props {
  items: CharacterItem[];
  attunementSlots: number;
  onChange: (items: CharacterItem[]) => void;
  onAttunementChange: (slots: number) => void;
}

export function InventorySection({ items, attunementSlots, onChange, onAttunementChange }: Props) {
  const { items: allItems, loading } = useItems();
  const [search, setSearch] = useState<string | null>(null);

  const selectData = allItems.map((item) => ({
    value: item.id!,
    label: `${item.name} (${item.source})`,
  }));

  function addFromSearch(itemId: string | null) {
    if (!itemId) return;
    const item = allItems.find((i) => i.id === itemId);
    if (!item) return;
    onChange([...items, { itemId: item.id!, name: item.name, quantity: 1, equipped: false, attuned: false }]);
    setSearch(null);
  }

  function updateItem(index: number, partial: Partial<CharacterItem>) {
    const next = items.map((item, i) => (i === index ? { ...item, ...partial } : item));
    onChange(next);
  }

  function addCustomItem() {
    onChange([...items, { itemId: '', name: '', quantity: 1, equipped: false, attuned: false }]);
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  const attunedCount = items.filter((i) => i.attuned).length;

  return (
    <Stack gap="xs">
      <Group gap="xs">
        <NumberInput
          label={<Text size="xs" fw={600} c="parchment.5">Attunement Slots</Text>}
          value={attunementSlots}
          onChange={(v) => onAttunementChange(numOrDefault(v, 3))}
          min={0}
          max={10}
          size="xs"
          w={120}
          styles={centeredInputStyles}
        />
        <NumberInput
          label={<Text size="xs" fw={600} c="parchment.5">Used</Text>}
          value={attunedCount}
          readOnly
          size="xs"
          w={60}
          styles={centeredInputStyles}
        />
      </Group>

      <Select
        placeholder="Search and add an item..."
        data={selectData}
        value={search}
        onChange={addFromSearch}
        searchable
        clearable
        nothingFoundMessage={loading ? 'Loading items...' : 'No items found'}
        size="xs"
        limit={30}
      />

      {items.length > 0 && (
        <Table withRowBorders verticalSpacing={2} horizontalSpacing="xs" fz="sm">
          <Table.Thead style={{ borderBottom: '1px solid rgba(191, 157, 100, 0.15)' }}>
            <Table.Tr>
              <Table.Th><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Item</Text></Table.Th>
              <Table.Th w={50} ta="center"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Qty</Text></Table.Th>
              <Table.Th w={30} ta="center" title="Equipped"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>E</Text></Table.Th>
              <Table.Th w={30} ta="center" title="Attuned"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>A</Text></Table.Th>
              <Table.Th w={30}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item, i) => (
              <Table.Tr key={i} style={
                item.attuned
                  ? { borderLeft: '2px solid var(--mantine-color-gold-5)' }
                  : item.equipped
                    ? { borderLeft: '2px solid var(--mantine-color-inkBrown-7)' }
                    : undefined
              }>
                <Table.Td>
                  {item.itemId ? (
                    <Group gap={4}>
                      <WikiLink tagType="item" name={item.name} />
                    </Group>
                  ) : (
                    <TextInput
                      value={item.name}
                      onChange={(e) => updateItem(i, { name: e.currentTarget.value })}
                      size="xs"
                      variant="unstyled"
                      placeholder="Custom item name"
                    />
                  )}
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={item.quantity}
                    onChange={(v) => updateItem(i, { quantity: numOrDefault(v, 1) })}
                    min={0}
                    size="xs"
                    w={45}
                    variant="unstyled"
                    styles={centeredInputStyles}
                  />
                </Table.Td>
                <Table.Td ta="center">
                  <Checkbox
                    size="xs"
                    checked={item.equipped}
                    onChange={(e) => updateItem(i, { equipped: e.currentTarget.checked })}
                  />
                </Table.Td>
                <Table.Td ta="center">
                  <Checkbox
                    size="xs"
                    checked={item.attuned}
                    onChange={(e) => updateItem(i, { attuned: e.currentTarget.checked })}
                  />
                </Table.Td>
                <Table.Td>
                  <RemoveButton onClick={() => removeItem(i)} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Button size="compact-xs" variant="subtle" onClick={addCustomItem}>+ Custom item</Button>
    </Stack>
  );
}

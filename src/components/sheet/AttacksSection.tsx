import { Stack, Table, TextInput, Button, Menu, Text } from '@mantine/core';
import type { CharacterAttack, CharacterItem, AbilityScores } from '@/types';
import { WikiLink } from '@/components/wiki/WikiLink';
import { useItems } from '@/hooks/useItems';
import { weaponAttackBonus, weaponDamage } from '@/utils/derived-stats';
import { RemoveButton } from './RemoveButton';

interface Props {
  attacks: CharacterAttack[];
  items: CharacterItem[];
  abilities: AbilityScores;
  level: number;
  onChange: (attacks: CharacterAttack[]) => void;
}

const WEAPON_TYPES = new Set(['M', 'R']);

export function AttacksSection({ attacks, items, abilities, level, onChange }: Props) {
  const { items: allItems } = useItems();

  function addBlank() {
    onChange([...attacks, { name: '', attackBonus: '', damage: '' }]);
  }

  function addFromWeapon(charItem: CharacterItem) {
    const itemData = allItems.find((i) => i.id === charItem.itemId);
    if (!itemData) {
      onChange([...attacks, { name: charItem.name, attackBonus: '', damage: '', itemId: charItem.itemId }]);
      return;
    }
    const atkBonus = weaponAttackBonus(
      itemData.type ?? 'M',
      itemData.properties ?? [],
      abilities,
      level,
    );
    const dmg = itemData.damage
      ? weaponDamage(
          itemData.damage,
          itemData.damageType ?? '',
          itemData.type ?? 'M',
          itemData.properties ?? [],
          abilities,
        )
      : '';
    onChange([...attacks, {
      name: charItem.name,
      attackBonus: atkBonus,
      damage: dmg,
      itemId: charItem.itemId,
    }]);
  }

  function updateAttack(index: number, partial: Partial<CharacterAttack>) {
    onChange(attacks.map((a, i) => (i === index ? { ...a, ...partial } : a)));
  }

  function removeAttack(index: number) {
    onChange(attacks.filter((_, i) => i !== index));
  }

  // Equipped weapons not already in the attacks list
  const equippedWeapons = items.filter((item) => {
    if (!item.equipped || !item.itemId) return false;
    const data = allItems.find((i) => i.id === item.itemId);
    if (!data || !WEAPON_TYPES.has(data.type ?? '')) return false;
    return !attacks.some((a) => a.itemId === item.itemId);
  });

  return (
    <Stack gap="xs">
      {attacks.length > 0 && (
        <Table withRowBorders verticalSpacing={2} horizontalSpacing="xs" fz="sm">
          <Table.Thead style={{ borderBottom: '1px solid rgba(191, 157, 100, 0.15)' }}>
            <Table.Tr>
              <Table.Th><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Name</Text></Table.Th>
              <Table.Th w={80} ta="center"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Atk Bonus</Text></Table.Th>
              <Table.Th><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Damage/Type</Text></Table.Th>
              <Table.Th w={30} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {attacks.map((attack, i) => (
              <Table.Tr key={i} style={attack.itemId ? { borderLeft: '2px solid var(--mantine-color-inkBrown-8)' } : undefined}>
                <Table.Td>
                  {attack.itemId ? (
                    <WikiLink tagType="item" name={attack.name} />
                  ) : (
                    <TextInput
                      value={attack.name}
                      onChange={(e) => updateAttack(i, { name: e.currentTarget.value })}
                      size="xs"
                      variant="unstyled"
                      placeholder="Attack name"
                    />
                  )}
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={attack.attackBonus}
                    onChange={(e) => updateAttack(i, { attackBonus: e.currentTarget.value })}
                    size="xs"
                    variant="unstyled"
                    ta="center"
                    placeholder="+0"
                    styles={{ input: { textAlign: 'center', fontFamily: 'monospace' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <TextInput
                    value={attack.damage}
                    onChange={(e) => updateAttack(i, { damage: e.currentTarget.value })}
                    size="xs"
                    variant="unstyled"
                    placeholder="1d8+3 slashing"
                    styles={{ input: { fontFamily: 'monospace' } }}
                  />
                </Table.Td>
                <Table.Td>
                  <RemoveButton onClick={() => removeAttack(i)} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Button.Group>
        <Button size="compact-xs" variant="subtle" onClick={addBlank}>
          + Add attack
        </Button>
        {equippedWeapons.length > 0 && (
          <Menu position="bottom-start" withinPortal>
            <Menu.Target>
              <Button size="compact-xs" variant="subtle" color="gold">
                + From weapon
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              {equippedWeapons.map((w) => (
                <Menu.Item key={w.itemId} onClick={() => addFromWeapon(w)}>
                  {w.name}
                </Menu.Item>
              ))}
            </Menu.Dropdown>
          </Menu>
        )}
      </Button.Group>
    </Stack>
  );
}

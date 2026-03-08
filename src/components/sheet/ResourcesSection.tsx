import { Stack, TextInput, NumberInput, Select, Table, Button, Text } from '@mantine/core';
import type { TrackedResource } from '@/types';
import { numOrDefault } from '@/utils/form-helpers';
import { centeredInputStyles } from '@/theme/styles';
import { RemoveButton } from './RemoveButton';

const RESET_OPTIONS = [
  { value: 'short', label: 'Short Rest' },
  { value: 'long', label: 'Long Rest' },
  { value: 'dawn', label: 'Dawn' },
  { value: 'never', label: 'Never' },
];

interface Props {
  resources: TrackedResource[];
  onChange: (resources: TrackedResource[]) => void;
}

export function ResourcesSection({ resources, onChange }: Props) {
  function updateResource(index: number, partial: Partial<TrackedResource>) {
    const next = resources.map((r, i) => (i === index ? { ...r, ...partial } : r));
    onChange(next);
  }

  function addResource() {
    onChange([...resources, { name: '', max: 1, used: 0, resetsOn: 'long' }]);
  }

  function removeResource(index: number) {
    onChange(resources.filter((_, i) => i !== index));
  }

  return (
    <Stack gap="xs">
      {resources.length > 0 && (
        <Table withRowBorders verticalSpacing={2} horizontalSpacing="xs" fz="sm">
          <Table.Thead style={{ borderBottom: '1px solid rgba(191, 157, 100, 0.15)' }}>
            <Table.Tr>
              <Table.Th><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Resource</Text></Table.Th>
              <Table.Th w={50} ta="center"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Used</Text></Table.Th>
              <Table.Th w={50} ta="center"><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Max</Text></Table.Th>
              <Table.Th w={110}><Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Resets</Text></Table.Th>
              <Table.Th w={30}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {resources.map((r, i) => (
              <Table.Tr key={i} style={r.used >= r.max && r.max > 0 ? { opacity: 0.5 } : undefined}>
                <Table.Td>
                  <TextInput
                    value={r.name}
                    onChange={(e) => updateResource(i, { name: e.currentTarget.value })}
                    size="xs"
                    variant="unstyled"
                    placeholder="e.g. Ki Points"
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={r.used}
                    onChange={(v) => updateResource(i, { used: numOrDefault(v, 0) })}
                    min={0}
                    max={r.max}
                    size="xs"
                    w={45}
                    variant="unstyled"
                    styles={centeredInputStyles}
                  />
                </Table.Td>
                <Table.Td>
                  <NumberInput
                    value={r.max}
                    onChange={(v) => updateResource(i, { max: numOrDefault(v, 1) })}
                    min={0}
                    size="xs"
                    w={45}
                    variant="unstyled"
                    styles={centeredInputStyles}
                  />
                </Table.Td>
                <Table.Td>
                  <Select
                    value={r.resetsOn}
                    onChange={(v) => updateResource(i, { resetsOn: (v ?? 'long') as TrackedResource['resetsOn'] })}
                    data={RESET_OPTIONS}
                    size="xs"
                    variant="unstyled"
                    w={100}
                  />
                </Table.Td>
                <Table.Td>
                  <RemoveButton onClick={() => removeResource(i)} />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      )}

      <Button size="compact-xs" variant="subtle" onClick={addResource}>+ Add resource</Button>
    </Stack>
  );
}

import { Group, Button, Text, Paper, Stack } from '@mantine/core';
import { IconSword, IconBolt, IconShield, IconPlayerSkipForward } from '@tabler/icons-react';
import { SectionTitle } from './SectionTitle';

interface Props {
  actionUsed: boolean;
  bonusActionUsed: boolean;
  reactionUsed: boolean;
  movementUsed: number;
  speed: string;
  onChange: (field: string, value: boolean | number) => void;
}

const darkPaperStyle = { backgroundColor: 'var(--mantine-color-dark-7)', border: '1px solid var(--mantine-color-dark-5)' };

function ActionToggle({
  label,
  icon,
  used,
  onToggle,
}: {
  label: string;
  icon: React.ReactNode;
  used: boolean;
  onToggle: () => void;
}) {
  return (
    <Paper
      p="xs"
      radius="sm"
      style={{
        ...darkPaperStyle,
        cursor: 'pointer',
        opacity: used ? 0.4 : 1,
        textDecoration: used ? 'line-through' : 'none',
        transition: 'opacity 150ms',
      }}
      onClick={onToggle}
    >
      <Stack gap={2} align="center">
        {icon}
        <Text size="xs" fw={500}>{label}</Text>
        <Text size="xs" c={used ? 'red' : 'green'}>{used ? 'Used' : 'Available'}</Text>
      </Stack>
    </Paper>
  );
}

export function ActionEconomySection({
  actionUsed,
  bonusActionUsed,
  reactionUsed,
  movementUsed,
  speed,
  onChange,
}: Props) {
  const speedNum = parseInt(speed) || 30;
  const movementLeft = Math.max(0, speedNum - movementUsed);

  function nextTurn() {
    onChange('actionUsed', false);
    onChange('bonusActionUsed', false);
    onChange('reactionUsed', false);
    onChange('movementUsed', 0);
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between">
        <SectionTitle>Action Economy</SectionTitle>
        <Button
          size="compact-xs"
          variant="light"
          color="gold"
          leftSection={<IconPlayerSkipForward size={14} />}
          onClick={nextTurn}
        >
          Next Turn
        </Button>
      </Group>
      <Group gap="xs">
        <ActionToggle
          label="Action"
          icon={<IconSword size={18} color="var(--mantine-color-gold-5)" />}
          used={actionUsed}
          onToggle={() => onChange('actionUsed', !actionUsed)}
        />
        <ActionToggle
          label="Bonus"
          icon={<IconBolt size={18} color="var(--mantine-color-gold-5)" />}
          used={bonusActionUsed}
          onToggle={() => onChange('bonusActionUsed', !bonusActionUsed)}
        />
        <ActionToggle
          label="Reaction"
          icon={<IconShield size={18} color="var(--mantine-color-gold-5)" />}
          used={reactionUsed}
          onToggle={() => onChange('reactionUsed', !reactionUsed)}
        />
        <Paper
          p="xs"
          radius="sm"
          style={{
            ...darkPaperStyle,
            cursor: 'pointer',
          }}
          onClick={() => {
            const used = movementUsed + 5;
            onChange('movementUsed', used > speedNum ? 0 : used);
          }}
        >
          <Stack gap={2} align="center">
            <Text size="sm" fw={700} c={movementLeft > 0 ? 'parchment.2' : 'red'}>
              {movementLeft} ft
            </Text>
            <Text size="xs" fw={500}>Movement</Text>
            <Text size="xs" c="parchment.5">of {speedNum} ft</Text>
          </Stack>
        </Paper>
      </Group>
    </Stack>
  );
}

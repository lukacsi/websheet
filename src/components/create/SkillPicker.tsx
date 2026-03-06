import { Checkbox, SimpleGrid, Text, Stack } from '@mantine/core';
import type { Skill } from '@/types';

interface SkillPickerProps {
  from: Skill[];
  count: number;
  chosen: Skill[];
  onChange: (chosen: Skill[]) => void;
  /** Skills already granted by background or race (shown grayed) */
  alreadyProficient?: Skill[];
}

function capitalize(s: string): string {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

export function SkillPicker({
  from,
  count,
  chosen,
  onChange,
  alreadyProficient = [],
}: SkillPickerProps) {
  const atMax = chosen.length >= count;

  function toggle(skill: Skill) {
    if (chosen.includes(skill)) {
      onChange(chosen.filter(s => s !== skill));
    } else if (!atMax) {
      onChange([...chosen, skill]);
    }
  }

  return (
    <Stack gap="xs">
      <Text size="sm" fw={500}>
        Choose {count} skill {count === 1 ? 'proficiency' : 'proficiencies'}
      </Text>
      <SimpleGrid cols={{ base: 2, sm: 3 }} spacing="xs">
        {from.map(skill => {
          const alreadyHas = alreadyProficient.includes(skill);
          const isChosen = chosen.includes(skill);
          return (
            <Checkbox
              key={skill}
              label={capitalize(skill)}
              checked={isChosen || alreadyHas}
              disabled={alreadyHas || (!isChosen && atMax)}
              onChange={() => toggle(skill)}
              styles={alreadyHas ? { label: { opacity: 0.5 } } : undefined}
            />
          );
        })}
      </SimpleGrid>
      <Text size="xs" c="dimmed">
        {chosen.length} / {count} selected
      </Text>
    </Stack>
  );
}

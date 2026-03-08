import { Table, Checkbox, Text, Badge } from '@mantine/core';
import type { AbilityScores, Skill } from '@/types';
import { SKILL_ABILITY } from '@/types';
import { skillModifier, formatModifier } from '@/utils/derived-stats';
import { WikiLink } from '@/components/wiki/WikiLink';
import { toggleArrayItem } from '@/utils/form-helpers';

const SKILLS = Object.keys(SKILL_ABILITY).sort() as Skill[];

const ABILITY_ABBR: Record<string, string> = {
  str: 'STR', dex: 'DEX', con: 'CON',
  int: 'INT', wis: 'WIS', cha: 'CHA',
};

interface Props {
  abilities: AbilityScores;
  proficiencies: Skill[];
  expertise: Skill[];
  level: number;
  onProfChange: (proficiencies: Skill[]) => void;
  onExpertiseChange: (expertise: Skill[]) => void;
}

export function SkillsSection({
  abilities, proficiencies, expertise, level,
  onProfChange, onExpertiseChange,
}: Props) {
  function toggleProf(skill: Skill) {
    if (proficiencies.includes(skill)) {
      onProfChange(proficiencies.filter((s) => s !== skill));
      if (expertise.includes(skill)) {
        onExpertiseChange(expertise.filter((s) => s !== skill));
      }
    } else {
      onProfChange([...proficiencies, skill]);
    }
  }

  function toggleExpertise(skill: Skill) {
    onExpertiseChange(toggleArrayItem(expertise, skill));
  }

  return (
    <Table withRowBorders={false} verticalSpacing={2}>
      <Table.Tbody>
        {SKILLS.map((skill) => {
          const abilityKey = SKILL_ABILITY[skill];
          const prof = proficiencies.includes(skill);
          const exp = expertise.includes(skill);
          const mod = skillModifier(abilities[abilityKey], prof, exp, level);
          return (
            <Table.Tr key={skill}>
              <Table.Td w={30}>
                <Checkbox
                  size="xs"
                  checked={prof}
                  onChange={() => toggleProf(skill)}
                />
              </Table.Td>
              <Table.Td w={30}>
                <Checkbox
                  size="xs"
                  checked={exp}
                  disabled={!prof}
                  onChange={() => toggleExpertise(skill)}
                  title="Expertise"
                  styles={exp ? { input: { backgroundColor: 'var(--mantine-color-inkBrown-6)' } } : undefined}
                />
              </Table.Td>
              <Table.Td w={40}>
                <Text size="sm" fw={600}>{formatModifier(mod)}</Text>
              </Table.Td>
              <Table.Td>
                <WikiLink tagType="skill" name={skill} />
              </Table.Td>
              <Table.Td w={40}>
                <Badge size="xs" variant="light" color="gray">{ABILITY_ABBR[abilityKey]}</Badge>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

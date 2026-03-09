import { Table, Checkbox, Text } from '@mantine/core';
import type { AbilityScores, Skill } from '@/types';
import { SKILL_ABILITY } from '@/types';
import { skillModifier, formatModifier } from '@/utils/derived-stats';
import { WikiLink } from '@/components/wiki/WikiLink';
import { toggleArrayItem } from '@/utils/form-helpers';

const SKILLS = Object.keys(SKILL_ABILITY).sort() as Skill[];

const LOWERCASE_WORDS = new Set(['of', 'the', 'a', 'an', 'and', 'or', 'in', 'on', 'at', 'to', 'for']);
function titleCase(s: string): string {
  return s.split(' ').map((w, i) =>
    i === 0 || !LOWERCASE_WORDS.has(w) ? w.charAt(0).toUpperCase() + w.slice(1) : w
  ).join(' ');
}

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
          const rowStyle = exp
            ? { borderLeft: '2px solid var(--mantine-color-gold-5)' }
            : prof
              ? { borderLeft: '2px solid var(--mantine-color-inkBrown-7)' }
              : { opacity: 0.6 };
          const modColor = mod > 0 ? undefined : mod < 0 ? 'bloodRed.4' : 'parchment.6';
          return (
            <Table.Tr key={skill} style={rowStyle}>
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
                <Text size="sm" fw={600} c={modColor}>{formatModifier(mod)}</Text>
              </Table.Td>
              <Table.Td>
                <WikiLink tagType="skill" name={skill} displayText={titleCase(skill)} />
              </Table.Td>
              <Table.Td w={40}>
                <Text size="xs" c="parchment.5" fw={500}>{ABILITY_ABBR[abilityKey]}</Text>
              </Table.Td>
            </Table.Tr>
          );
        })}
      </Table.Tbody>
    </Table>
  );
}

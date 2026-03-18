import { Stack, Text, Accordion } from '@mantine/core';
import { SectionTitle } from './SectionTitle';

const STANDARD_ACTIONS = [
  { name: 'Attack', type: 'action', desc: 'Make a melee or ranged attack with a weapon or unarmed strike.' },
  { name: 'Cast a Spell', type: 'action', desc: 'Cast a spell with a casting time of 1 action.' },
  { name: 'Dash', type: 'action', desc: 'Double your movement speed for this turn.' },
  { name: 'Disengage', type: 'action', desc: 'Your movement does not provoke opportunity attacks for the rest of the turn.' },
  { name: 'Dodge', type: 'action', desc: 'Attacks against you have disadvantage, and you have advantage on DEX saves until your next turn.' },
  { name: 'Help', type: 'action', desc: 'Give an ally advantage on their next ability check or attack roll.' },
  { name: 'Hide', type: 'action', desc: 'Make a Stealth check to become hidden.' },
  { name: 'Ready', type: 'action', desc: 'Prepare an action to trigger on a specific condition. Uses your reaction when triggered.' },
  { name: 'Use an Object', type: 'action', desc: 'Interact with an object that requires your action (potion, item, etc.).' },
  { name: 'Grapple', type: 'action', desc: 'Replace one attack with a grapple. Contested Athletics vs Athletics/Acrobatics.' },
  { name: 'Shove', type: 'action', desc: 'Replace one attack to push a creature 5 ft or knock prone. Contested Athletics vs Athletics/Acrobatics.' },
  { name: 'Opportunity Attack', type: 'reaction', desc: 'When a creature you can see moves out of your reach, make one melee attack.' },
];

const accordionStyles = {
  control: { padding: '4px 8px', backgroundColor: 'transparent' },
  content: { padding: '4px 8px' },
  item: { borderColor: 'var(--mantine-color-dark-5)' },
};

export function StandardActionsSection() {
  return (
    <Stack gap="xs">
      <SectionTitle>Standard Actions</SectionTitle>
      <Accordion variant="separated" styles={accordionStyles}>
        {STANDARD_ACTIONS.map((a) => (
          <Accordion.Item key={a.name} value={a.name}>
            <Accordion.Control>
              <Text size="sm" fw={500}>
                {a.name}
                {a.type === 'reaction' && (
                  <Text component="span" size="xs" c="parchment.5" ml={6}>(reaction)</Text>
                )}
              </Text>
            </Accordion.Control>
            <Accordion.Panel>
              <Text size="xs" c="parchment.4">{a.desc}</Text>
            </Accordion.Panel>
          </Accordion.Item>
        ))}
      </Accordion>
    </Stack>
  );
}

import { Accordion, Badge, Group, Text, Stack, Radio } from '@mantine/core';
import type { Entry } from '@/types';
import type { RaceTraits } from './types';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import {
  FeatureChoicePicker,
  findOptionsBlocks,
  stripOptionsEntries,
} from '@/components/create/FeatureChoicePicker';
import {
  findListChoiceBlocks,
  stripListChoiceEntries,
} from '@/utils/features';
import { accordionDarkStyles } from '@/theme/styles';

interface Props {
  raceTraits: RaceTraits;
  raceName: string;
  featureChoices: Record<string, string[]>;
  onFeatureChoicesChange: (choices: Record<string, string[]>) => void;
}

export function RaceTraitsAccordion({ raceTraits, raceName, featureChoices, onFeatureChoicesChange }: Props) {
  const raceKey = `race:${raceName}`;
  const hasRefOptions = findOptionsBlocks(raceKey, raceTraits.traits).length > 0;
  const refSelected = featureChoices[raceKey] ?? [];
  const listChoices = findListChoiceBlocks(raceTraits.traits);
  const hasChoices = hasRefOptions || listChoices.length > 0;

  let displayEntries: Entry[] = raceTraits.traits;
  if (hasRefOptions) {
    displayEntries = stripOptionsEntries(displayEntries);
  }
  for (const lc of listChoices) {
    const choiceKey = `race:${lc.parentName}`;
    const sel = featureChoices[choiceKey]?.[0];
    displayEntries = stripListChoiceEntries(displayEntries, sel);
  }

  return (
    <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
      <Accordion.Item value="race-traits">
        <Accordion.Control>
          <Group gap="xs">
            <Badge size="xs" variant="light" color="green">Race</Badge>
            <Text size="sm" fw={600}>{raceName} Traits</Text>
            {hasChoices && !hasRefOptions && listChoices.some((lc) => !(featureChoices[`race:${lc.parentName}`]?.[0])) && (
              <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
            )}
            {hasRefOptions && refSelected.length === 0 && (
              <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
            )}
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <EntryRenderer entries={displayEntries} />

          {hasRefOptions && (
            <FeatureChoicePicker
              featureName={raceKey}
              entries={raceTraits.traits}
              selected={refSelected}
              onChange={(sel) => onFeatureChoicesChange({ ...featureChoices, [raceKey]: sel })}
            />
          )}

          {listChoices.map((lc) => {
            const choiceKey = `race:${lc.parentName}`;
            const selected = featureChoices[choiceKey]?.[0] ?? '';
            return (
              <Radio.Group
                key={choiceKey}
                value={selected}
                onChange={(v) => onFeatureChoicesChange({ ...featureChoices, [choiceKey]: v ? [v] : [] })}
              >
                <Stack gap="xs" mt="sm">
                  <Text size="sm" fw={500}>Choose one ({lc.parentName}):</Text>
                  <Group gap="md">
                    {lc.items.map((item) => (
                      <Radio key={item.name} value={item.name} label={item.name} />
                    ))}
                  </Group>
                </Stack>
              </Radio.Group>
            );
          })}
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

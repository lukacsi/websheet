import { Accordion, Badge, Group, Text } from '@mantine/core';
import type { ClassFeatureRecord } from './types';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import {
  FeatureChoicePicker,
  findOptionsBlocks,
  stripOptionsEntries,
} from '@/components/create/FeatureChoicePicker';
import { accordionDarkStyles } from '@/theme/styles';

interface Props {
  features: ClassFeatureRecord[];
  featureChoices: Record<string, string[]>;
  onFeatureChoicesChange: (choices: Record<string, string[]>) => void;
}

export function ClassFeaturesAccordion({ features, featureChoices, onFeatureChoicesChange }: Props) {
  return (
    <Accordion variant="separated" chevronPosition="left" styles={accordionDarkStyles}>
      {features.map((f) => {
        const hasOptions = findOptionsBlocks(f.name, f.entries).length > 0;
        const selected = featureChoices[f.name] ?? [];
        return (
          <Accordion.Item key={f.id} value={f.id}>
            <Accordion.Control>
              <Group gap="xs">
                <Badge size="xs" variant="light" color="blue">
                  Lv {f.level}
                </Badge>
                {f.isSubclassFeature && (
                  <Badge size="xs" variant="light" color="grape">
                    {f.subclassName}
                  </Badge>
                )}
                <Text size="sm" fw={600}>{f.name}</Text>
                {hasOptions && selected.length === 0 && (
                  <Badge size="xs" variant="light" color="yellow">Choice needed</Badge>
                )}
              </Group>
            </Accordion.Control>
            <Accordion.Panel>
              <EntryRenderer entries={hasOptions ? stripOptionsEntries(f.entries) : f.entries} />
              {hasOptions && (
                <FeatureChoicePicker
                  featureName={f.name}
                  entries={f.entries}
                  selected={selected}
                  onChange={(sel) => onFeatureChoicesChange({ ...featureChoices, [f.name]: sel })}
                />
              )}
            </Accordion.Panel>
          </Accordion.Item>
        );
      })}
    </Accordion>
  );
}

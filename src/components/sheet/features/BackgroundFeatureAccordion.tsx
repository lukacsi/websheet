import { Accordion, Badge, Group, Text } from '@mantine/core';
import type { BackgroundFeature } from './types';
import { EntryRenderer } from '@/components/create/EntryRenderer';
import { accordionStyles } from '@/theme/styles';

interface Props {
  bgFeature: BackgroundFeature;
}

export function BackgroundFeatureAccordion({ bgFeature }: Props) {
  return (
    <Accordion variant="separated" chevronPosition="left" styles={accordionStyles}>
      <Accordion.Item value="bg-feature">
        <Accordion.Control>
          <Group gap="xs">
            <Badge size="xs" variant="light" color="inkBrown">Background</Badge>
            <Text size="sm" fw={600}>{bgFeature.featureName}</Text>
          </Group>
        </Accordion.Control>
        <Accordion.Panel>
          <EntryRenderer entries={bgFeature.featureEntries} />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}

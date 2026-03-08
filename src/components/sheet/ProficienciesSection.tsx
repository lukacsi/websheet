import { Stack, Text, Group, Badge, TextInput } from '@mantine/core';
import { useState } from 'react';
import { WikiLink } from '@/components/wiki/WikiLink';
import { TaggedText } from '@/components/wiki/TaggedText';
import type { EntityTagType } from '@/utils/parse-tags';
import { RemoveButton } from './RemoveButton';

interface TagListProps {
  label: string;
  items: string[];
  linkType?: EntityTagType;
  onChange: (items: string[]) => void;
}

function TagList({ label, items, linkType, onChange }: TagListProps) {
  const [input, setInput] = useState('');

  function addItem() {
    const trimmed = input.trim();
    if (trimmed && !items.includes(trimmed)) {
      onChange([...items, trimmed]);
    }
    setInput('');
  }

  function removeItem(item: string) {
    onChange(items.filter((i) => i !== item));
  }

  return (
    <Stack gap={4}>
      <Text size="xs" fw={600} c="parchment.4" tt="uppercase" style={{ letterSpacing: '0.5px' }}>{label}</Text>
      <Group gap={4} wrap="wrap">
        {items.map((item) => (
          <Group key={item} gap={2} wrap="nowrap">
            {item.includes('{@') ? (
              <Text size="sm" component="span"><TaggedText text={item} /></Text>
            ) : linkType ? (
              <WikiLink tagType={linkType} name={item} />
            ) : (
              <Badge variant="light" color="inkBrown" size="md">{item}</Badge>
            )}
            <RemoveButton variant="badge" onClick={() => removeItem(item)} />
          </Group>
        ))}
        <TextInput
          size="xs"
          variant="unstyled"
          placeholder="Add..."
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addItem();
            }
          }}
          w={100}
          styles={{ input: { minHeight: 24 } }}
        />
      </Group>
    </Stack>
  );
}

interface Props {
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  languages: string[];
  onChange: (field: string, values: string[]) => void;
}

export function ProficienciesSection({
  armorProficiencies, weaponProficiencies, toolProficiencies, languages, onChange,
}: Props) {
  return (
    <Stack gap="sm">
      <TagList label="Armor" items={armorProficiencies} onChange={(v) => onChange('armorProficiencies', v)} />
      <TagList label="Weapons" items={weaponProficiencies} onChange={(v) => onChange('weaponProficiencies', v)} />
      <TagList label="Tools" items={toolProficiencies} linkType="item" onChange={(v) => onChange('toolProficiencies', v)} />
      <TagList label="Languages" items={languages} linkType="language" onChange={(v) => onChange('languages', v)} />
    </Stack>
  );
}

import { Textarea, Text } from '@mantine/core';

interface Props {
  notes: string;
  onChange: (notes: string) => void;
}

export function NotesSection({ notes, onChange }: Props) {
  return (
    <Textarea
      label={<Text size="xs" fw={600} c="parchment.5" tt="uppercase" style={{ letterSpacing: '0.5px' }}>Notes</Text>}
      value={notes}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="Character notes, backstory, session logs..."
      minRows={4}
      autosize
      maxRows={20}
      variant="unstyled"
    />
  );
}

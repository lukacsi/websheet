import { Textarea } from '@mantine/core';

interface Props {
  notes: string;
  onChange: (notes: string) => void;
}

export function NotesSection({ notes, onChange }: Props) {
  return (
    <Textarea
      value={notes}
      onChange={(e) => onChange(e.currentTarget.value)}
      placeholder="Character notes, backstory, session logs..."
      minRows={4}
      autosize
      maxRows={20}
    />
  );
}

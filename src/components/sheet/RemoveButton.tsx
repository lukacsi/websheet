import { ActionIcon, Badge } from '@mantine/core';

interface RemoveButtonProps {
  onClick: () => void;
  variant?: 'icon' | 'badge';
  title?: string;
}

export function RemoveButton({ onClick, variant = 'icon', title = 'Remove' }: RemoveButtonProps) {
  if (variant === 'badge') {
    return (
      <Badge
        size="xs"
        variant="light"
        color="red"
        style={{ cursor: 'pointer' }}
        onClick={onClick}
        title={title}
      >
        &times;
      </Badge>
    );
  }

  return (
    <ActionIcon size="xs" variant="subtle" color="red" onClick={onClick} title={title}>
      &times;
    </ActionIcon>
  );
}

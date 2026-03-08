import { Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Title
      order={5}
      tt="uppercase"
      size="sm"
      c="parchment.4"
      mt="sm"
      mb="xs"
      style={{ borderLeft: '3px solid var(--mantine-color-parchment-6)', paddingLeft: 8, letterSpacing: '1px' }}
    >
      {children}
    </Title>
  );
}

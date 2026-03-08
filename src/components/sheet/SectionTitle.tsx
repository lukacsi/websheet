import { Title } from '@mantine/core';
import type { ReactNode } from 'react';

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Title
      order={5}
      tt="uppercase"
      size="sm"
      c="parchment.4"
      mb="xs"
      pb={4}
      style={{ borderBottom: '1px solid var(--mantine-color-dark-5)' }}
    >
      {children}
    </Title>
  );
}

import { Container, Title, Text } from '@mantine/core';

export function LoadCharacter() {
  return (
    <Container size="md" py="xl">
      <Title order={2}>Load Character</Title>
      <Text c="dimmed">Coming soon — enter character name + passphrase to load</Text>
    </Container>
  );
}

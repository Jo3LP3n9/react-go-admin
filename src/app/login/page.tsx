'use client';

import { Container, Paper, Title, Text } from '@mantine/core';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <Container size={420} my={40}>
      <Title ta="center" style={{ fontWeight: 900 }}>
        Go-Admin System
      </Title>
      <Text c="dimmed" size="sm" ta="center" mt={5}>
        Sign in to your account
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <LoginForm />
      </Paper>
    </Container>
  );
}

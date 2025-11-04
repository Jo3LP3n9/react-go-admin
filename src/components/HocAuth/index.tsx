'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Text } from '@mantine/core';

interface Props {
  children: ReactNode;
  required?: string; // permission string
  fallback?: ReactNode;
}

export default function HocAuth({ children, required, fallback }: Props) {
  const { hasPermission } = usePermissions();

  if (!required) return <>{children}</>;

  if (!hasPermission(required)) {
    return fallback || (
      <Text c="dimmed" ta="center" mt="xl">
        🚫 You do not have permission to view this content.
      </Text>
    );
  }

  return <>{children}</>;
}
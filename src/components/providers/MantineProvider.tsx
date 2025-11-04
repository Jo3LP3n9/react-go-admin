'use client';

import { ReactNode } from 'react';
import { MantineProvider as Provider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { theme } from '@/styles/theme';

export function MantineProvider({ children }: { children: ReactNode }) {
  return (
    <Provider theme={theme} defaultColorScheme="auto">
      <ModalsProvider>
        {children}
      </ModalsProvider>
    </Provider>
  );
}

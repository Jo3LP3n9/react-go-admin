'use client';

import { ReactNode, useEffect, useState } from 'react';
import { AppShell, LoadingOverlay } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { AdminNavbar } from '@/components/layout/AdminNavbar';
import { AdminSidebar } from '@/components/layout/AdminSidebar';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    const token = localStorage.getItem('token');
    const auth = localStorage.getItem('auth');
    
    if (!token || auth !== 'true') {
      console.log('Not authenticated, redirecting to login');
      router.push('/login');
    } else {
      console.log('Authenticated, loading admin panel');
      setIsAuthenticated(true);
    }
    
    setIsLoading(false);
  }, [router]);

  if (isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <AdminNavbar />
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <AdminSidebar />
      </AppShell.Navbar>
      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}

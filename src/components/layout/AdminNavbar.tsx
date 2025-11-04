'use client';

import { useEffect, useState } from 'react';
import { Group, Text, Menu, Avatar, Badge } from '@mantine/core';
import { IconUser, IconLogout, IconUserCircle } from '@tabler/icons-react';
import { useRouter } from 'next/navigation';

interface UserProfile {
  userId?: number;
  username?: string;
  nickName?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  roleName?: string;
  deptName?: string;
  status?: string;
}

export function AdminNavbar() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);
        console.log('Navbar user loaded:', userData);
      } catch (error) {
        console.error('Failed to parse user info:', error);
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('auth');
    localStorage.removeItem('routes');
    router.push('/login');
  };

  const handleProfile = () => {
    router.push('/profile');
  };

  return (
    <Group h="100%" px="md" justify="space-between">
      <Group>
        <Text size="xl" fw={700}>Go-Admin System</Text>
        {user?.roleName && (
          <Badge color="blue" variant="light" size="sm">
            {user.roleName}
          </Badge>
        )}
      </Group>
      
      <Menu shadow="md" width={220} position="bottom-end">
        <Menu.Target>
          <Group style={{ cursor: 'pointer' }} gap="xs">
            {user?.avatar ? (
              <Avatar src={user.avatar} size="sm" radius="xl" />
            ) : (
              <Avatar color="blue" size="sm" radius="xl">
                <IconUser size={18} />
              </Avatar>
            )}
            <div style={{ lineHeight: 1 }}>
              <Text size="sm" fw={500}>
                {user?.nickName || user?.username || 'User'}
              </Text>
              {user?.email && (
                <Text size="xs" c="dimmed">
                  {user.email}
                </Text>
              )}
            </div>
          </Group>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>Account</Menu.Label>
          <Menu.Item 
            leftSection={<IconUserCircle size={16} />}
            onClick={handleProfile}
          >
            Profile
          </Menu.Item>
          
          <Menu.Divider />
          
          <Menu.Label>System</Menu.Label>
          {user?.deptName && (
            <Menu.Item disabled>
              <Text size="xs" c="dimmed">Department: {user.deptName}</Text>
            </Menu.Item>
          )}
          
          <Menu.Divider />
          
          <Menu.Item 
            color="red"
            leftSection={<IconLogout size={16} />}
            onClick={handleLogout}
          >
            Logout
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}

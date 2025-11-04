'use client';

import { useEffect, useState } from 'react';
import { Container, Title, SimpleGrid, Paper, Text, Card, Group, Stack, Badge, Divider } from '@mantine/core';
import { IconUsers, IconFileText, IconSettings, IconShield, IconMenu2 } from '@tabler/icons-react';

interface UserProfile {
  userId?: number;
  username?: string;
  nickName?: string;
  email?: string;
  phone?: string;
  sex?: string;
  avatar?: string;
  roleId?: number;
  roleName?: string;
  roleSortOrder?: number;
  deptId?: number;
  deptName?: string;
  postId?: number;
  postName?: string;
  remark?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface MenuItem {
  menuId?: number;
  menuName?: string;
  title?: string;
  icon?: string;
  path?: string;
  paths?: string;
  menuType?: string;
  children?: MenuItem[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [routes, setRoutes] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load user info and routes from localStorage
    const userInfo = localStorage.getItem('user');
    const routeList = localStorage.getItem('routes');
    
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        setUser(userData);
        console.log('User profile loaded:', userData);
      } catch (error) {
        console.error('Failed to parse user info:', error);
      }
    }
    
    if (routeList) {
      try {
        const routeData = JSON.parse(routeList);
        setRoutes(routeData);
        console.log('Available routes loaded:', routeData);
      } catch (error) {
        console.error('Failed to parse routes:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const stats = [
    { title: 'Total Users', value: '0', icon: IconUsers, color: 'blue' },
    { title: 'Articles', value: '0', icon: IconFileText, color: 'green' },
    { title: 'System Config', value: '0', icon: IconSettings, color: 'orange' },
    { title: 'Roles', value: '0', icon: IconShield, color: 'red' },
  ];

  const countMenuItems = (items: MenuItem[]): number => {
    let count = 0;
    items.forEach(item => {
      count++;
      if (item.children && item.children.length > 0) {
        count += countMenuItems(item.children);
      }
    });
    return count;
  };

  const renderMenuTree = (items: MenuItem[], level: number = 0): JSX.Element[] => {
    return items.map((item, index) => (
      <div key={item.menuId || index} style={{ marginLeft: level * 16 }}>
        <Text size="sm" mb="xs">
          {item.icon && <span style={{ marginRight: 8 }}>{item.icon}</span>}
          <strong>{item.menuName || item.title}</strong>
          {item.path && <Text span c="dimmed" size="xs" ml="xs">({item.path})</Text>}
          {item.menuType && (
            <Badge size="xs" ml="xs" color={item.menuType === 'M' ? 'blue' : 'gray'}>
              {item.menuType}
            </Badge>
          )}
        </Text>
        {item.children && item.children.length > 0 && renderMenuTree(item.children, level + 1)}
      </div>
    ));
  };

  if (loading) {
    return (
      <Container size="xl">
        <Title order={1} mb="xl">Loading Dashboard...</Title>
      </Container>
    );
  }

  return (
    <Container size="xl">
      <Title order={1} mb="xl">Dashboard</Title>
      
      {user && (
        <Card withBorder mb="xl" p="lg">
          <Group justify="space-between">
            <Stack gap="xs">
              <Text size="lg" fw={700}>
                Welcome back, {user.nickName || user.username || 'User'}!
              </Text>
              <Group gap="md">
                {user.email && <Text size="sm" c="dimmed">📧 {user.email}</Text>}
                {user.phone && <Text size="sm" c="dimmed">📱 {user.phone}</Text>}
              </Group>
              <Group gap="sm">
                {user.roleName && (
                  <Badge color="blue" variant="light">
                    Role: {user.roleName}
                  </Badge>
                )}
                {user.deptName && (
                  <Badge color="green" variant="light">
                    Dept: {user.deptName}
                  </Badge>
                )}
                {user.postName && (
                  <Badge color="orange" variant="light">
                    Post: {user.postName}
                  </Badge>
                )}
              </Group>
            </Stack>
            {user.status && (
              <Badge 
                size="lg" 
                color={user.status === '1' || user.status === 'active' ? 'green' : 'red'}
              >
                {user.status === '1' || user.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </Group>
        </Card>
      )}
      
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg" mb="xl">
        {stats.map((stat) => (
          <Paper key={stat.title} withBorder p="md" radius="md">
            <Group>
              <stat.icon size={32} color={stat.color} />
              <div>
                <Text size="xl" fw={700}>{stat.value}</Text>
                <Text size="sm" c="dimmed">{stat.title}</Text>
              </div>
            </Group>
          </Paper>
        ))}
      </SimpleGrid>
      
      {routes.length > 0 && (
        <Card withBorder p="lg">
          <Group mb="md">
            <IconMenu2 size={24} />
            <Title order={3}>Available Menu Items</Title>
            <Badge size="lg" color="blue" variant="filled">
              {countMenuItems(routes)} items
            </Badge>
          </Group>
          <Divider mb="md" />
          <Stack gap="sm">
            {renderMenuTree(routes)}
          </Stack>
        </Card>
      )}
      
      {routes.length === 0 && !loading && (
        <Card withBorder p="lg">
          <Text c="dimmed" ta="center">
            No menu items available. Please contact your administrator.
          </Text>
        </Card>
      )}
    </Container>
  );
}

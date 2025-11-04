'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Paper, Table, Group, Button, ActionIcon, LoadingOverlay, Text, Badge } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconRefresh, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface Menu {
  menuId: number; menuName: string; title?: string; icon?: string; path?: string;
  component?: string; menuType?: string; visible?: string; status?: string;
  perms?: string; permission?: string; sort?: number; parentId?: number; children?: Menu[];
}

export default function MenusPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-menu');
      if (response.data.code === 200) {
        setMenus(response.data.data || []);
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to fetch menus', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMenus(); }, []);

  const toggleExpand = (menuId: number) => {
    const newExpanded = new Set(expanded);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpanded(newExpanded);
  };

  const handleDelete = async (menuId: number) => {
    if (!confirm('Delete this menu?')) return;
    try {
      const res = await apiClient.delete(`/admin/sys/sys-menu/${menuId}`);
      if (res.data.code === 200) {
        notifications.show({ title: 'Success', message: 'Menu deleted', color: 'green' });
        fetchMenus();
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Delete failed', color: 'red' });
    }
  };

  const renderMenuRow = (menu: Menu, level: number = 0): JSX.Element[] => {
    const hasChildren = menu.children && menu.children.length > 0;
    const isExpanded = expanded.has(menu.menuId);
    
    const rows: JSX.Element[] = [
      <Table.Tr key={menu.menuId}>
        <Table.Td>
          <Group gap="xs" style={{ marginLeft: level * 20 }}>
            {hasChildren && (
              <ActionIcon size="xs" variant="subtle" onClick={() => toggleExpand(menu.menuId)}>
                {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
              </ActionIcon>
            )}
            {!hasChildren && <div style={{ width: 22 }} />}
            {menu.icon && <span>{menu.icon}</span>}
            <Text size="sm">{menu.menuName || menu.title}</Text>
          </Group>
        </Table.Td>
        <Table.Td>
          <Badge size="sm" color={menu.menuType === 'M' ? 'blue' : menu.menuType === 'C' ? 'green' : 'gray'}>
            {menu.menuType === 'M' ? 'Directory' : menu.menuType === 'C' ? 'Menu' : menu.menuType === 'F' ? 'Button' : menu.menuType || '-'}
          </Badge>
        </Table.Td>
        <Table.Td>{menu.path || '-'}</Table.Td>
        <Table.Td><Text size="xs" c="dimmed">{menu.component || '-'}</Text></Table.Td>
        <Table.Td>{menu.permission || menu.perms || '-'}</Table.Td>
        <Table.Td>{menu.sort || 0}</Table.Td>
        <Table.Td>
          <Badge color={menu.visible === '1' || !menu.visible ? 'green' : 'red'}>
            {menu.visible === '0' ? 'Hidden' : 'Visible'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon variant="light" color="blue" size="sm"><IconEdit size={14} /></ActionIcon>
            <ActionIcon variant="light" color="green" size="sm"><IconPlus size={14} /></ActionIcon>
            <ActionIcon variant="light" color="red" size="sm" onClick={() => handleDelete(menu.menuId)}>
              <IconTrash size={14} /></ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    ];

    if (hasChildren && isExpanded) {
      menu.children!.forEach(child => {
        rows.push(...renderMenuRow(child, level + 1));
      });
    }

    return rows;
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Menu Management</Title>
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={fetchMenus}><IconRefresh size={16} /></ActionIcon>
            <Button variant="light" onClick={() => {
              const allIds = new Set<number>();
              const collectIds = (items: Menu[]) => {
                items.forEach(item => {
                  if (item.children && item.children.length > 0) {
                    allIds.add(item.menuId);
                    collectIds(item.children);
                  }
                });
              };
              collectIds(menus);
              setExpanded(allIds);
            }}>Expand All</Button>
            <Button variant="light" onClick={() => setExpanded(new Set())}>Collapse All</Button>
          </Group>
          <Button leftSection={<IconPlus size={16} />}>Add Menu</Button>
        </Group>
      </Paper>
      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Menu Name</Table.Th><Table.Th>Type</Table.Th><Table.Th>Path</Table.Th>
              <Table.Th>Component</Table.Th><Table.Th>Permission</Table.Th><Table.Th>Sort</Table.Th>
              <Table.Th>Visible</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {menus.length === 0 && !loading ? (
              <Table.Tr><Table.Td colSpan={8}><Text ta="center" c="dimmed">No menus</Text></Table.Td></Table.Tr>
            ) : (
              menus.flatMap(menu => renderMenuRow(menu))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

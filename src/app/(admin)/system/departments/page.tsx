'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Paper, Table, Group, Button, ActionIcon, LoadingOverlay, Text, Badge } from '@mantine/core';
import { IconPlus, IconEdit, IconTrash, IconRefresh, IconChevronRight, IconChevronDown } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface Department {
  deptId: number; deptName: string; parentId?: number; orderNum?: number;
  leader?: string; phone?: string; email?: string; status?: string; children?: Department[];
}

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-dept/dept-tree');
      if (response.data.code === 200) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to fetch departments', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepartments(); }, []);

  const toggleExpand = (deptId: number) => {
    const newExpanded = new Set(expanded);
    newExpanded.has(deptId) ? newExpanded.delete(deptId) : newExpanded.add(deptId);
    setExpanded(newExpanded);
  };

  const renderDepartmentRow = (dept: Department, level: number = 0): JSX.Element[] => {
    const hasChildren = dept.children && dept.children.length > 0;
    const isExpanded = expanded.has(dept.deptId);
    
    const rows: JSX.Element[] = [
      <Table.Tr key={dept.deptId}>
        <Table.Td>
          <Group gap="xs" style={{ marginLeft: level * 20 }}>
            {hasChildren && (
              <ActionIcon size="xs" variant="subtle" onClick={() => toggleExpand(dept.deptId)}>
                {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
              </ActionIcon>
            )}
            {!hasChildren && <div style={{ width: 22 }} />}
            <Text size="sm" fw={level === 0 ? 600 : 400}>{dept.deptName}</Text>
          </Group>
        </Table.Td>
        <Table.Td>{dept.orderNum || 0}</Table.Td>
        <Table.Td>{dept.leader || '-'}</Table.Td>
        <Table.Td>{dept.phone || '-'}</Table.Td>
        <Table.Td>{dept.email || '-'}</Table.Td>
        <Table.Td>
          <Badge color={dept.status === '1' ? 'green' : 'red'}>
            {dept.status === '1' ? 'Active' : 'Inactive'}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Group gap="xs">
            <ActionIcon variant="light" color="blue" size="sm"><IconEdit size={14} /></ActionIcon>
            <ActionIcon variant="light" color="green" size="sm"><IconPlus size={14} /></ActionIcon>
            <ActionIcon variant="light" color="red" size="sm"><IconTrash size={14} /></ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    ];

    if (hasChildren && isExpanded) {
      dept.children!.forEach(child => rows.push(...renderDepartmentRow(child, level + 1)));
    }

    return rows;
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Department Management</Title>
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <ActionIcon variant="light" onClick={fetchDepartments}><IconRefresh size={16} /></ActionIcon>
            <Button variant="light" onClick={() => {
              const allIds = new Set<number>();
              const collectIds = (items: Department[]) => {
                items.forEach(item => {
                  if (item.children?.length) {
                    allIds.add(item.deptId);
                    collectIds(item.children);
                  }
                });
              };
              collectIds(departments);
              setExpanded(allIds);
            }}>Expand All</Button>
            <Button variant="light" onClick={() => setExpanded(new Set())}>Collapse All</Button>
          </Group>
          <Button leftSection={<IconPlus size={16} />}>Add Department</Button>
        </Group>
      </Paper>
      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Department Name</Table.Th><Table.Th>Sort</Table.Th><Table.Th>Leader</Table.Th>
              <Table.Th>Phone</Table.Th><Table.Th>Email</Table.Th><Table.Th>Status</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {departments.length === 0 && !loading ? (
              <Table.Tr><Table.Td colSpan={7}><Text ta="center" c="dimmed">No departments</Text></Table.Td></Table.Tr>
            ) : (
              departments.flatMap(dept => renderDepartmentRow(dept))
            )}
          </Table.Tbody>
        </Table>
      </Paper>
    </Container>
  );
}

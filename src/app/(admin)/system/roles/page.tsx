'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Table, 
  Group, 
  Button, 
  TextInput,
  Badge,
  ActionIcon,
  Pagination,
  LoadingOverlay,
  Text
} from '@mantine/core';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconRefresh,
  IconKey
} from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { RoleModal } from '@/components/modals/RoleModal';

interface Role {
  roleId: number;
  roleName: string;
  roleKey?: string;
  roleSort?: number;
  status?: string;
  dataScope?: string;
  remark?: string;
  admin?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  // Modal state
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-role', {
        params: {
          page,
          pageSize,
          roleName: searchTerm || undefined,
        }
      });
      
      if (response.data.code === 200) {
        const data = response.data.data;
        setRoles(data.list || data || []);
        setTotal(data.total || 0);
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to fetch roles',
          color: 'red',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch roles:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to fetch roles',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchRoles();
  };

  const handleDelete = async (roleId: number) => {
    if (!confirm('Are you sure you want to delete this role?')) return;
    
    try {
      const response = await apiClient.delete('/admin/sys/sys-role', {
        data: { roleId }
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Role deleted successfully',
          color: 'green',
        });
        fetchRoles();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to delete role',
        color: 'red',
      });
    }
  };

  const handleCreate = () => {
    setSelectedRole(undefined);
    setModalOpened(true);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setModalOpened(true);
  };

  const getDataScopeLabel = (scope?: string) => {
    const scopes: Record<string, string> = {
      '1': 'All Data',
      '2': 'Custom',
      '3': 'Department',
      '4': 'Dept & Below',
      '5': 'Self Only',
    };
    return scopes[scope || '1'] || 'Unknown';
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Role Management</Title>
      
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder="Search by role name"
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
            <ActionIcon variant="light" onClick={fetchRoles}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add Role
          </Button>
        </Group>
      </Paper>

      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Role ID</Table.Th>
              <Table.Th>Role Name</Table.Th>
              <Table.Th>Role Key</Table.Th>
              <Table.Th>Sort Order</Table.Th>
              <Table.Th>Data Scope</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Remark</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {roles.length === 0 && !loading ? (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed">No roles found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              roles.map((role) => (
                <Table.Tr key={role.roleId}>
                  <Table.Td>{role.roleId}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      {role.admin && <Badge size="xs" color="red">Admin</Badge>}
                      {role.roleName}
                    </Group>
                  </Table.Td>
                  <Table.Td>{role.roleKey || '-'}</Table.Td>
                  <Table.Td>{role.roleSort || 0}</Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">
                      {getDataScopeLabel(role.dataScope)}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge color={role.status === '1' ? 'green' : 'red'}>
                      {role.status === '1' ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Text size="xs" lineClamp={1}>{role.remark || '-'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => handleEdit(role)}
                        title="Edit"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => handleDelete(role.roleId)}
                        disabled={role.admin}
                        title="Delete"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        
        {total > pageSize && (
          <Group justify="center" p="md">
            <Pagination
              total={Math.ceil(total / pageSize)}
              value={page}
              onChange={setPage}
            />
          </Group>
        )}
      </Paper>

      <RoleModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => {
          fetchRoles();
          setModalOpened(false);
        }}
        role={selectedRole}
      />
    </Container>
  );
}
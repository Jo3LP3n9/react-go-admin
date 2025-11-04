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
import { UserModal } from '@/components/modals/UserModal';

interface User {
  userId: number;
  username: string;
  nickName?: string;
  email?: string;
  phone?: string;
  sex?: string;
  avatar?: string;
  status?: string;
  deptId?: number;
  roleId?: number;
  postId?: number;
  roleName?: string;
  deptName?: string;
  postName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  // Modal state
  const [modalOpened, setModalOpened] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | undefined>();
  
  // Metadata for dropdowns
  const [roles, setRoles] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-user', {
        params: {
          page,
          pageSize,
          username: searchTerm || undefined,
        }
      });
      
      if (response.data.code === 200) {
        const data = response.data.data;
        setUsers(data.list || data || []);
        setTotal(data.total || 0);
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to fetch users',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to fetch users',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      // Fetch roles
      const rolesResponse = await apiClient.get('/admin/sys/sys-role/list');
      if (rolesResponse.data.code === 200) {
        setRoles(rolesResponse.data.data || []);
      }

      // Fetch departments (flatten tree)
      const deptsResponse = await apiClient.get('/admin/sys/sys-dept/dept-tree');
      if (deptsResponse.data.code === 200) {
        const flattenDepts = (depts: any[]): any[] => {
          return depts.reduce((acc, dept) => {
            acc.push(dept);
            if (dept.children) {
              acc.push(...flattenDepts(dept.children));
            }
            return acc;
          }, []);
        };
        setDepartments(flattenDepts(deptsResponse.data.data || []));
      }

      // Fetch posts
      const postsResponse = await apiClient.get('/admin/sys/sys-post/list');
      if (postsResponse.data.code === 200) {
        setPosts(postsResponse.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  useEffect(() => {
    fetchMetadata();
  }, []);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleDelete = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await apiClient.delete('/admin/sys/sys-user', {
        data: { userId }
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'User deleted successfully',
          color: 'green',
        });
        fetchUsers();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to delete user',
        color: 'red',
      });
    }
  };

  const handleResetPassword = async (userId: number, username: string) => {
    const newPassword = prompt(`Reset password for user: ${username}\nEnter new password:`);
    if (!newPassword) return;
    
    if (newPassword.length < 6) {
      notifications.show({
        title: 'Error',
        message: 'Password must be at least 6 characters',
        color: 'red',
      });
      return;
    }

    try {
      const response = await apiClient.put('/admin/sys/sys-user/pwd-reset', {
        userId,
        password: require('md5')(newPassword),
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Password reset successfully',
          color: 'green',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to reset password',
        color: 'red',
      });
    }
  };

  const handleCreate = () => {
    setSelectedUser(undefined);
    setModalOpened(true);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpened(true);
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">System Users</Title>
      
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder="Search by username"
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
            <ActionIcon variant="light" onClick={fetchUsers}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
          <Button leftSection={<IconPlus size={16} />} onClick={handleCreate}>
            Add User
          </Button>
        </Group>
      </Paper>

      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>User ID</Table.Th>
              <Table.Th>Username</Table.Th>
              <Table.Th>Nick Name</Table.Th>
              <Table.Th>Email</Table.Th>
              <Table.Th>Phone</Table.Th>
              <Table.Th>Department</Table.Th>
              <Table.Th>Role</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {users.length === 0 && !loading ? (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Text ta="center" c="dimmed">No users found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              users.map((user) => (
                <Table.Tr key={user.userId}>
                  <Table.Td>{user.userId}</Table.Td>
                  <Table.Td>{user.username}</Table.Td>
                  <Table.Td>{user.nickName || '-'}</Table.Td>
                  <Table.Td>{user.email || '-'}</Table.Td>
                  <Table.Td>{user.phone || '-'}</Table.Td>
                  <Table.Td>{user.deptName || '-'}</Table.Td>
                  <Table.Td>{user.roleName || '-'}</Table.Td>
                  <Table.Td>
                    <Badge color={user.status === '1' ? 'green' : 'red'}>
                      {user.status === '1' ? 'Active' : 'Inactive'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => handleEdit(user)}
                        title="Edit"
                      >
                        <IconEdit size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="orange"
                        onClick={() => handleResetPassword(user.userId, user.username)}
                        title="Reset Password"
                      >
                        <IconKey size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => handleDelete(user.userId)}
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

      <UserModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={() => {
          fetchUsers();
          setModalOpened(false);
        }}
        user={selectedUser}
        roles={roles}
        departments={departments}
        posts={posts}
      />
    </Container>
  );
}
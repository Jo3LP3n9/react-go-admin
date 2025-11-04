'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Paper, Table, Group, Button, TextInput, Badge, ActionIcon, Pagination, LoadingOverlay, Text } from '@mantine/core';
import { IconSearch, IconPlus, IconEdit, IconTrash, IconRefresh } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface Post {
  postId: number; postCode: string; postName: string; postSort: number;
  status: string; remark?: string; createdAt?: string;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-post', {
        params: { page, pageSize, postName: searchTerm || undefined }
      });
      if (response.data.code === 200) {
        const data = response.data.data;
        setPosts(data.list || data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to fetch posts', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPosts(); }, [page]);

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Post Management</Title>
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <TextInput placeholder="Search post" leftSection={<IconSearch size={16} />}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (setPage(1), fetchPosts())} />
            <Button onClick={() => (setPage(1), fetchPosts())}>Search</Button>
            <ActionIcon variant="light" onClick={fetchPosts}><IconRefresh size={16} /></ActionIcon>
          </Group>
          <Button leftSection={<IconPlus size={16} />}>Add Post</Button>
        </Group>
      </Paper>
      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th><Table.Th>Code</Table.Th><Table.Th>Name</Table.Th>
              <Table.Th>Sort</Table.Th><Table.Th>Status</Table.Th><Table.Th>Remark</Table.Th>
              <Table.Th>Created</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {posts.length === 0 && !loading ? (
              <Table.Tr><Table.Td colSpan={8}><Text ta="center" c="dimmed">No posts</Text></Table.Td></Table.Tr>
            ) : (
              posts.map((post) => (
                <Table.Tr key={post.postId}>
                  <Table.Td>{post.postId}</Table.Td>
                  <Table.Td>{post.postCode}</Table.Td>
                  <Table.Td>{post.postName}</Table.Td>
                  <Table.Td>{post.postSort}</Table.Td>
                  <Table.Td><Badge color={post.status === '1' ? 'green' : 'red'}>
                    {post.status === '1' ? 'Active' : 'Inactive'}</Badge></Table.Td>
                  <Table.Td>{post.remark || '-'}</Table.Td>
                  <Table.Td>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '-'}</Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon variant="light" color="blue"><IconEdit size={16} /></ActionIcon>
                      <ActionIcon variant="light" color="red"><IconTrash size={16} /></ActionIcon>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
        {total > pageSize && (
          <Group justify="center" p="md">
            <Pagination total={Math.ceil(total / pageSize)} value={page} onChange={setPage} />
          </Group>
        )}
      </Paper>
    </Container>
  );
}

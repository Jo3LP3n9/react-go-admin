'use client';

import { useEffect, useState } from 'react';
import { Container, Title, Paper, Table, Group, Button, TextInput, Badge, ActionIcon, Pagination, LoadingOverlay, Text } from '@mantine/core';
import { IconSearch, IconRefresh, IconTrash, IconDownload } from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

interface LoginLog {
  infoId: number; username: string; ipaddr: string; loginLocation?: string;
  browser?: string; os?: string; status: string; msg?: string; loginTime: string;
}

export default function LoginLogsPage() {
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-login-log', {
        params: { page, pageSize, username: searchTerm || undefined }
      });
      if (response.data.code === 200) {
        const data = response.data.data;
        setLogs(data.list || data || []);
        setTotal(data.total || 0);
      }
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to fetch logs', color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [page]);

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Login Logs</Title>
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <TextInput placeholder="Search username" leftSection={<IconSearch size={16} />}
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (setPage(1), fetchLogs())} />
            <Button onClick={() => (setPage(1), fetchLogs())}>Search</Button>
            <ActionIcon variant="light" onClick={fetchLogs}><IconRefresh size={16} /></ActionIcon>
          </Group>
          <Button leftSection={<IconDownload size={16} />} variant="light">Export</Button>
        </Group>
      </Paper>
      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th><Table.Th>Username</Table.Th><Table.Th>IP</Table.Th>
              <Table.Th>Location</Table.Th><Table.Th>Browser</Table.Th><Table.Th>OS</Table.Th>
              <Table.Th>Status</Table.Th><Table.Th>Message</Table.Th><Table.Th>Time</Table.Th><Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.length === 0 && !loading ? (
              <Table.Tr><Table.Td colSpan={10}><Text ta="center" c="dimmed">No logs</Text></Table.Td></Table.Tr>
            ) : (
              logs.map((log) => (
                <Table.Tr key={log.infoId}>
                  <Table.Td>{log.infoId}</Table.Td>
                  <Table.Td>{log.username}</Table.Td>
                  <Table.Td>{log.ipaddr}</Table.Td>
                  <Table.Td>{log.loginLocation || '-'}</Table.Td>
                  <Table.Td>{log.browser || '-'}</Table.Td>
                  <Table.Td>{log.os || '-'}</Table.Td>
                  <Table.Td><Badge color={log.status === '0' ? 'green' : 'red'}>
                    {log.status === '0' ? 'Success' : 'Failed'}</Badge></Table.Td>
                  <Table.Td><Text size="xs" lineClamp={1}>{log.msg || '-'}</Text></Table.Td>
                  <Table.Td>{log.loginTime ? new Date(log.loginTime).toLocaleString() : '-'}</Table.Td>
                  <Table.Td>
                    <ActionIcon variant="light" color="red"><IconTrash size={16} /></ActionIcon>
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

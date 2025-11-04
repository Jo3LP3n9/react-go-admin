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
  Text,
  Modal,
  Stack,
  Code,
  Divider,
  ScrollArea,
  CopyButton,
  Tooltip
} from '@mantine/core';
import { 
  IconSearch, 
  IconRefresh,
  IconTrash,
  IconDownload,
  IconEye,
  IconCopy,
  IconCheck
} from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

// ============================================
// INTERFACES
// ============================================

interface OperLog {
  operId: number;
  title: string;
  businessType: string;
  method: string;
  requestMethod: string;
  operatorType: string;
  operName: string;
  deptName?: string;
  operUrl: string;
  operIp: string;
  operLocation?: string;
  operParam?: string;
  jsonResult?: string;
  status: string;
  errorMsg?: string;
  operTime: string;
}

// ============================================
// DETAIL MODAL COMPONENT
// ============================================

function OperLogDetailModal({ 
  opened, 
  onClose, 
  log 
}: { 
  opened: boolean; 
  onClose: () => void; 
  log: OperLog | null;
}) {
  if (!log) return null;

  const getBusinessTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      '0': { label: 'Other', color: 'gray' },
      '1': { label: 'Insert', color: 'green' },
      '2': { label: 'Update', color: 'blue' },
      '3': { label: 'Delete', color: 'red' },
      '4': { label: 'Grant', color: 'cyan' },
      '5': { label: 'Export', color: 'orange' },
      '6': { label: 'Import', color: 'purple' },
      '7': { label: 'Force Logout', color: 'red' },
      '8': { label: 'Generate Code', color: 'indigo' },
      '9': { label: 'Clear Data', color: 'pink' },
    };
    const typeInfo = types[type] || types['0'];
    return <Badge color={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  const formatJson = (jsonStr?: string) => {
    if (!jsonStr) return 'N/A';
    try {
      const parsed = JSON.parse(jsonStr);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return jsonStr;
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Operation Log Details"
      size="xl"
    >
      <ScrollArea h={600}>
        <Stack gap="md">
          {/* Basic Info */}
          <div>
            <Text size="sm" fw={600} c="dimmed">Title</Text>
            <Text size="md" mt={4}>{log.title}</Text>
          </div>

          <Divider />

          <div>
            <Text size="sm" fw={600} c="dimmed">Business Type</Text>
            <Group mt={4}>
              {getBusinessTypeBadge(log.businessType)}
            </Group>
          </div>

          <Divider />

          {/* Request Info */}
          <div>
            <Text size="sm" fw={600} c="dimmed">Request Method</Text>
            <Group mt={4} gap="xs">
              <Badge size="lg" variant="filled">{log.requestMethod}</Badge>
              <Text size="sm" c="dimmed">{log.method}</Text>
            </Group>
          </div>

          <div>
            <Group justify="space-between" align="center">
              <Text size="sm" fw={600} c="dimmed">Request URL</Text>
              <CopyButton value={log.operUrl}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? 'Copied' : 'Copy'}>
                    <ActionIcon 
                      color={copied ? 'teal' : 'gray'} 
                      variant="subtle" 
                      onClick={copy}
                      size="sm"
                    >
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Code block mt={4}>{log.operUrl}</Code>
          </div>

          {log.operParam && (
            <div>
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} c="dimmed">Request Parameters</Text>
                <CopyButton value={log.operParam}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'}>
                      <ActionIcon 
                        color={copied ? 'teal' : 'gray'} 
                        variant="subtle" 
                        onClick={copy}
                        size="sm"
                      >
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Code block mt={4} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formatJson(log.operParam)}
              </Code>
            </div>
          )}

          <Divider />

          {/* Response Info */}
          {log.jsonResult && (
            <div>
              <Group justify="space-between" align="center">
                <Text size="sm" fw={600} c="dimmed">Response Data</Text>
                <CopyButton value={log.jsonResult}>
                  {({ copied, copy }) => (
                    <Tooltip label={copied ? 'Copied' : 'Copy'}>
                      <ActionIcon 
                        color={copied ? 'teal' : 'gray'} 
                        variant="subtle" 
                        onClick={copy}
                        size="sm"
                      >
                        {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                      </ActionIcon>
                    </Tooltip>
                  )}
                </CopyButton>
              </Group>
              <Code block mt={4} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {formatJson(log.jsonResult)}
              </Code>
            </div>
          )}

          {log.errorMsg && (
            <div>
              <Text size="sm" fw={600} c="red">Error Message</Text>
              <Code block color="red" mt={4} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {log.errorMsg}
              </Code>
            </div>
          )}

          <Divider />

          {/* Operator Info */}
          <div>
            <Text size="sm" fw={600} c="dimmed">Operator</Text>
            <Group mt={4} gap="xs">
              <Text size="sm">{log.operName}</Text>
              {log.deptName && (
                <>
                  <Text size="sm" c="dimmed">•</Text>
                  <Text size="sm" c="dimmed">{log.deptName}</Text>
                </>
              )}
            </Group>
          </div>

          <div>
            <Text size="sm" fw={600} c="dimmed">IP Address & Location</Text>
            <Group mt={4} gap="xs">
              <Badge variant="light">{log.operIp}</Badge>
              {log.operLocation && (
                <Text size="sm" c="dimmed">{log.operLocation}</Text>
              )}
            </Group>
          </div>

          <div>
            <Text size="sm" fw={600} c="dimmed">Operation Time</Text>
            <Text size="sm" mt={4}>{new Date(log.operTime).toLocaleString()}</Text>
          </div>

          <div>
            <Text size="sm" fw={600} c="dimmed">Status</Text>
            <Group mt={4}>
              <Badge color={log.status === '0' ? 'green' : 'red'} size="lg">
                {log.status === '0' ? 'Success' : 'Failed'}
              </Badge>
            </Group>
          </div>
        </Stack>
      </ScrollArea>

      <Group justify="flex-end" mt="md">
        <Button onClick={onClose}>Close</Button>
      </Group>
    </Modal>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function OperationLogsPage() {
  const [logs, setLogs] = useState<OperLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(10);
  
  // Detail modal
  const [detailModal, setDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<OperLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-oper-log', {
        params: {
          page,
          pageSize,
          title: searchTerm || undefined,
        }
      });
      
      console.log('Operation logs response:', response.data);
      
      if (response.data.code === 200) {
        const data = response.data.data;
        setLogs(data.list || data || []);
        setTotal(data.total || 0);
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to fetch operation logs',
          color: 'red',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch operation logs:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to fetch operation logs',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleDelete = async (operId: number) => {
    if (!confirm('Are you sure you want to delete this operation log?')) return;
    
    try {
      const response = await apiClient.delete('/admin/sys/sys-oper-log', {
        data: { operId }
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Operation log deleted successfully',
          color: 'green',
        });
        fetchLogs();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to delete operation log',
        color: 'red',
      });
    }
  };

  const handleExport = async () => {
    try {
      const response = await apiClient.get('/admin/sys/sys-oper-log/export', {
        params: { title: searchTerm || undefined },
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `operation-logs-${Date.now()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      notifications.show({
        title: 'Success',
        message: 'Operation logs exported successfully',
        color: 'green',
      });
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to export operation logs',
        color: 'red',
      });
    }
  };

  const getBusinessTypeBadge = (type: string) => {
    const types: Record<string, { label: string; color: string }> = {
      '0': { label: 'Other', color: 'gray' },
      '1': { label: 'Insert', color: 'green' },
      '2': { label: 'Update', color: 'blue' },
      '3': { label: 'Delete', color: 'red' },
      '4': { label: 'Grant', color: 'cyan' },
      '5': { label: 'Export', color: 'orange' },
      '6': { label: 'Import', color: 'purple' },
      '7': { label: 'Force Logout', color: 'red' },
      '8': { label: 'Generate Code', color: 'indigo' },
      '9': { label: 'Clear Data', color: 'pink' },
    };
    const typeInfo = types[type] || types['0'];
    return <Badge color={typeInfo.color}>{typeInfo.label}</Badge>;
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Operation Logs</Title>
      
      <Paper withBorder p="md" mb="md">
        <Group justify="space-between">
          <Group>
            <TextInput
              placeholder="Search by title"
              leftSection={<IconSearch size={16} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button onClick={handleSearch}>Search</Button>
            <ActionIcon variant="light" onClick={fetchLogs}>
              <IconRefresh size={16} />
            </ActionIcon>
          </Group>
          <Button 
            leftSection={<IconDownload size={16} />}
            variant="light"
            onClick={handleExport}
          >
            Export
          </Button>
        </Group>
      </Paper>

      <Paper withBorder style={{ position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Oper ID</Table.Th>
              <Table.Th>Title</Table.Th>
              <Table.Th>Business Type</Table.Th>
              <Table.Th>Method</Table.Th>
              <Table.Th>Request Method</Table.Th>
              <Table.Th>Operator</Table.Th>
              <Table.Th>IP Address</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Operation Time</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {logs.length === 0 && !loading ? (
              <Table.Tr>
                <Table.Td colSpan={10}>
                  <Text ta="center" c="dimmed">No operation logs found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              logs.map((log) => (
                <Table.Tr key={log.operId}>
                  <Table.Td>{log.operId}</Table.Td>
                  <Table.Td>{log.title}</Table.Td>
                  <Table.Td>{getBusinessTypeBadge(log.businessType)}</Table.Td>
                  <Table.Td>
                    <Text size="xs" lineClamp={1} maw={200}>
                      {log.method}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Badge size="sm" variant="light">{log.requestMethod}</Badge>
                  </Table.Td>
                  <Table.Td>{log.operName}</Table.Td>
                  <Table.Td>{log.operIp}</Table.Td>
                  <Table.Td>
                    <Badge color={log.status === '0' ? 'green' : 'red'}>
                      {log.status === '0' ? 'Success' : 'Failed'}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    {log.operTime ? new Date(log.operTime).toLocaleString() : '-'}
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs">
                      <ActionIcon 
                        variant="light" 
                        color="blue"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailModal(true);
                        }}
                        title="View Details"
                      >
                        <IconEye size={16} />
                      </ActionIcon>
                      <ActionIcon 
                        variant="light" 
                        color="red"
                        onClick={() => handleDelete(log.operId)}
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

      <OperLogDetailModal
        opened={detailModal}
        onClose={() => setDetailModal(false)}
        log={selectedLog}
      />
    </Container>
  );
}
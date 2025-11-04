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
  Tabs,
  Modal,
  Stack,
  Textarea,
  Select,
  NumberInput
} from '@mantine/core';
import { 
  IconSearch, 
  IconPlus, 
  IconEdit, 
  IconTrash, 
  IconRefresh,
  IconList,
  IconDownload
} from '@tabler/icons-react';
import { useForm } from '@mantine/form';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';

// ============================================
// INTERFACES
// ============================================

interface DictType {
  dictId: number;
  dictName: string;
  dictType: string;
  status: string;
  remark?: string;
  createdAt?: string;
}

interface DictData {
  dictCode: number;
  dictSort: number;
  dictLabel: string;
  dictValue: string;
  dictType: string;
  cssClass?: string;
  listClass?: string;
  isDefault: string;
  status: string;
  remark?: string;
  createdAt?: string;
}

// ============================================
// DICTIONARY TYPE MODAL
// ============================================

function DictTypeModal({ 
  opened, 
  onClose, 
  onSuccess, 
  dictType 
}: { 
  opened: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  dictType?: DictType;
}) {
  const isEdit = !!dictType;
  
  const form = useForm({
    initialValues: {
      dictName: '',
      dictType: '',
      status: '1',
      remark: '',
    },
    validate: {
      dictName: (v) => (!v ? 'Dictionary name is required' : null),
      dictType: (v) => {
        if (!v) return 'Dictionary type is required';
        if (!/^[a-zA-Z0-9_]{2,50}$/.test(v)) {
          return 'Type: 2-50 chars, letters, numbers, underscore only';
        }
        return null;
      },
    },
  });

  useEffect(() => {
    if (dictType && opened) {
      form.setValues({
        dictName: dictType.dictName,
        dictType: dictType.dictType,
        status: dictType.status || '1',
        remark: dictType.remark || '',
      });
    } else if (!opened) {
      form.reset();
    }
  }, [dictType, opened]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      let response;
      if (isEdit) {
        response = await apiClient.put(`/admin/sys/sys-dict/type/${dictType.dictId}`, values);
      } else {
        response = await apiClient.post('/admin/sys/sys-dict/type', values);
      }

      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: `Dictionary type ${isEdit ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Operation failed',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Operation failed',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Dictionary Type' : 'Create Dictionary Type'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Dictionary Name"
            placeholder="Enter dictionary name"
            required
            {...form.getInputProps('dictName')}
          />
          
          <TextInput
            label="Dictionary Type"
            placeholder="Enter type key (e.g., sys_status)"
            required
            disabled={isEdit}
            {...form.getInputProps('dictType')}
          />

          <Select
            label="Status"
            data={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...form.getInputProps('status')}
          />

          <Textarea
            label="Remark"
            placeholder="Enter remark (optional)"
            rows={3}
            {...form.getInputProps('remark')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

// ============================================
// DICTIONARY DATA MODAL
// ============================================

function DictDataModal({ 
  opened, 
  onClose, 
  onSuccess, 
  dictData,
  dictType
}: { 
  opened: boolean; 
  onClose: () => void; 
  onSuccess: () => void; 
  dictData?: DictData;
  dictType: string;
}) {
  const isEdit = !!dictData;
  
  const form = useForm({
    initialValues: {
      dictLabel: '',
      dictValue: '',
      dictSort: 0,
      dictType: dictType,
      cssClass: '',
      listClass: 'default',
      isDefault: 'N',
      status: '1',
      remark: '',
    },
    validate: {
      dictLabel: (v) => (!v ? 'Label is required' : null),
      dictValue: (v) => (!v ? 'Value is required' : null),
    },
  });

  useEffect(() => {
    if (dictData && opened) {
      form.setValues({
        dictLabel: dictData.dictLabel,
        dictValue: dictData.dictValue,
        dictSort: dictData.dictSort,
        dictType: dictData.dictType,
        cssClass: dictData.cssClass || '',
        listClass: dictData.listClass || 'default',
        isDefault: dictData.isDefault || 'N',
        status: dictData.status || '1',
        remark: dictData.remark || '',
      });
    } else if (!opened) {
      form.reset();
      form.setFieldValue('dictType', dictType);
    }
  }, [dictData, opened, dictType]);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      let response;
      if (isEdit) {
        response = await apiClient.put(`/admin/sys/sys-dict/data/${dictData.dictCode}`, values);
      } else {
        response = await apiClient.post('/admin/sys/sys-dict/data', values);
      }

      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: `Dictionary data ${isEdit ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Operation failed',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Operation failed',
        color: 'red',
      });
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Dictionary Data' : 'Create Dictionary Data'}
      size="md"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Dictionary Type"
            value={dictType}
            disabled
          />

          <TextInput
            label="Data Label"
            placeholder="Enter display label"
            required
            {...form.getInputProps('dictLabel')}
          />
          
          <TextInput
            label="Data Value"
            placeholder="Enter value"
            required
            {...form.getInputProps('dictValue')}
          />

          <NumberInput
            label="Sort Order"
            min={0}
            {...form.getInputProps('dictSort')}
          />

          <Select
            label="List Class"
            data={[
              { value: 'default', label: 'Default' },
              { value: 'primary', label: 'Primary' },
              { value: 'success', label: 'Success' },
              { value: 'info', label: 'Info' },
              { value: 'warning', label: 'Warning' },
              { value: 'danger', label: 'Danger' },
            ]}
            {...form.getInputProps('listClass')}
          />

          <Select
            label="Is Default"
            data={[
              { value: 'Y', label: 'Yes' },
              { value: 'N', label: 'No' },
            ]}
            {...form.getInputProps('isDefault')}
          />

          <Select
            label="Status"
            data={[
              { value: '1', label: 'Active' },
              { value: '0', label: 'Inactive' },
            ]}
            {...form.getInputProps('status')}
          />

          <TextInput
            label="CSS Class"
            placeholder="Enter CSS class (optional)"
            {...form.getInputProps('cssClass')}
          />

          <Textarea
            label="Remark"
            placeholder="Enter remark (optional)"
            rows={3}
            {...form.getInputProps('remark')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>Cancel</Button>
            <Button type="submit">{isEdit ? 'Update' : 'Create'}</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function DictionariesPage() {
  const [activeTab, setActiveTab] = useState<string | null>('types');
  
  // Dictionary Types
  const [dictTypes, setDictTypes] = useState<DictType[]>([]);
  const [typesLoading, setTypesLoading] = useState(true);
  const [typesSearch, setTypesSearch] = useState('');
  const [typesPage, setTypesPage] = useState(1);
  const [typesTotal, setTypesTotal] = useState(0);
  const [typeModalOpened, setTypeModalOpened] = useState(false);
  const [selectedDictType, setSelectedDictType] = useState<DictType | undefined>();
  
  // Dictionary Data
  const [dictData, setDictData] = useState<DictData[]>([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataPage, setDataPage] = useState(1);
  const [dataTotal, setDataTotal] = useState(0);
  const [currentDictType, setCurrentDictType] = useState<string>('');
  const [dataModalOpened, setDataModalOpened] = useState(false);
  const [selectedDictData, setSelectedDictData] = useState<DictData | undefined>();
  
  const pageSize = 10;

  // Fetch Dictionary Types
  const fetchDictTypes = async () => {
    setTypesLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-dict/type', {
        params: {
          page: typesPage,
          pageSize,
          dictName: typesSearch || undefined,
        }
      });
      
      if (response.data.code === 200) {
        const data = response.data.data;
        setDictTypes(data.list || data || []);
        setTypesTotal(data.total || 0);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch dictionary types',
        color: 'red',
      });
    } finally {
      setTypesLoading(false);
    }
  };

  // Fetch Dictionary Data
  const fetchDictData = async (dictType?: string) => {
    const type = dictType || currentDictType;
    if (!type) return;
    
    setDataLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-dict/data', {
        params: {
          page: dataPage,
          pageSize,
          dictType: type,
        }
      });
      
      if (response.data.code === 200) {
        const data = response.data.data;
        setDictData(data.list || data || []);
        setDataTotal(data.total || 0);
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: 'Failed to fetch dictionary data',
        color: 'red',
      });
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'types') {
      fetchDictTypes();
    }
  }, [typesPage, activeTab]);

  useEffect(() => {
    if (activeTab === 'data' && currentDictType) {
      fetchDictData();
    }
  }, [dataPage, activeTab, currentDictType]);

  // Delete Dictionary Type
  const handleDeleteType = async (dictId: number) => {
    if (!confirm('Delete this dictionary type? All related data will be deleted!')) return;
    
    try {
      const response = await apiClient.delete('/admin/sys/sys-dict/type', {
        data: { dictId }
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Dictionary type deleted successfully',
          color: 'green',
        });
        fetchDictTypes();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Delete failed',
        color: 'red',
      });
    }
  };

  // Delete Dictionary Data
  const handleDeleteData = async (dictCode: number) => {
    if (!confirm('Delete this dictionary data?')) return;
    
    try {
      const response = await apiClient.delete('/admin/sys/sys-dict/data', {
        data: { dictCode }
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Dictionary data deleted successfully',
          color: 'green',
        });
        fetchDictData();
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Delete failed',
        color: 'red',
      });
    }
  };

  const handleViewData = (dictType: string) => {
    setCurrentDictType(dictType);
    setDataPage(1);
    setActiveTab('data');
    setTimeout(() => fetchDictData(dictType), 100);
  };

  const getListClassColor = (listClass?: string) => {
    const colors: Record<string, string> = {
      primary: 'blue',
      success: 'green',
      info: 'cyan',
      warning: 'orange',
      danger: 'red',
      default: 'gray',
    };
    return colors[listClass || 'default'] || 'gray';
  };

  return (
    <Container size="xl">
      <Title order={2} mb="lg">Dictionary Management</Title>
      
      <Paper withBorder>
        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="types">Dictionary Types</Tabs.Tab>
            <Tabs.Tab value="data">Dictionary Data</Tabs.Tab>
          </Tabs.List>

          {/* DICTIONARY TYPES TAB */}
          <Tabs.Panel value="types" pt="md">
            <Paper withBorder p="md" mb="md">
              <Group justify="space-between">
                <Group>
                  <TextInput
                    placeholder="Search by name"
                    leftSection={<IconSearch size={16} />}
                    value={typesSearch}
                    onChange={(e) => setTypesSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (setTypesPage(1), fetchDictTypes())}
                  />
                  <Button onClick={() => (setTypesPage(1), fetchDictTypes())}>Search</Button>
                  <ActionIcon variant="light" onClick={fetchDictTypes}>
                    <IconRefresh size={16} />
                  </ActionIcon>
                </Group>
                <Button 
                  leftSection={<IconPlus size={16} />}
                  onClick={() => {
                    setSelectedDictType(undefined);
                    setTypeModalOpened(true);
                  }}
                >
                  Add Type
                </Button>
              </Group>
            </Paper>

            <Paper withBorder style={{ position: 'relative' }}>
              <LoadingOverlay visible={typesLoading} />
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Dict ID</Table.Th>
                    <Table.Th>Dictionary Name</Table.Th>
                    <Table.Th>Dictionary Type</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Remark</Table.Th>
                    <Table.Th>Created At</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {dictTypes.length === 0 && !typesLoading ? (
                    <Table.Tr>
                      <Table.Td colSpan={7}>
                        <Text ta="center" c="dimmed">No dictionary types found</Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : (
                    dictTypes.map((dict) => (
                      <Table.Tr key={dict.dictId}>
                        <Table.Td>{dict.dictId}</Table.Td>
                        <Table.Td>{dict.dictName}</Table.Td>
                        <Table.Td>
                          <Badge variant="light">{dict.dictType}</Badge>
                        </Table.Td>
                        <Table.Td>
                          <Badge color={dict.status === '1' ? 'green' : 'red'}>
                            {dict.status === '1' ? 'Active' : 'Inactive'}
                          </Badge>
                        </Table.Td>
                        <Table.Td>{dict.remark || '-'}</Table.Td>
                        <Table.Td>
                          {dict.createdAt ? new Date(dict.createdAt).toLocaleDateString() : '-'}
                        </Table.Td>
                        <Table.Td>
                          <Group gap="xs">
                            <ActionIcon 
                              variant="light" 
                              color="blue"
                              onClick={() => {
                                setSelectedDictType(dict);
                                setTypeModalOpened(true);
                              }}
                              title="Edit"
                            >
                              <IconEdit size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="light" 
                              color="cyan"
                              onClick={() => handleViewData(dict.dictType)}
                              title="View Data"
                            >
                              <IconList size={16} />
                            </ActionIcon>
                            <ActionIcon 
                              variant="light" 
                              color="red"
                              onClick={() => handleDeleteType(dict.dictId)}
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
              
              {typesTotal > pageSize && (
                <Group justify="center" p="md">
                  <Pagination
                    total={Math.ceil(typesTotal / pageSize)}
                    value={typesPage}
                    onChange={setTypesPage}
                  />
                </Group>
              )}
            </Paper>
          </Tabs.Panel>

          {/* DICTIONARY DATA TAB */}
          <Tabs.Panel value="data" pt="md">
            {currentDictType ? (
              <>
                <Paper withBorder p="md" mb="md">
                  <Group justify="space-between">
                    <Group>
                      <Badge size="lg" variant="filled">{currentDictType}</Badge>
                      <ActionIcon variant="light" onClick={() => fetchDictData()}>
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Group>
                    <Button 
                      leftSection={<IconPlus size={16} />}
                      onClick={() => {
                        setSelectedDictData(undefined);
                        setDataModalOpened(true);
                      }}
                    >
                      Add Data
                    </Button>
                  </Group>
                </Paper>

                <Paper withBorder style={{ position: 'relative' }}>
                  <LoadingOverlay visible={dataLoading} />
                  <Table striped highlightOnHover>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>Dict Code</Table.Th>
                        <Table.Th>Sort</Table.Th>
                        <Table.Th>Label</Table.Th>
                        <Table.Th>Value</Table.Th>
                        <Table.Th>List Class</Table.Th>
                        <Table.Th>Default</Table.Th>
                        <Table.Th>Status</Table.Th>
                        <Table.Th>Remark</Table.Th>
                        <Table.Th>Actions</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {dictData.length === 0 && !dataLoading ? (
                        <Table.Tr>
                          <Table.Td colSpan={9}>
                            <Text ta="center" c="dimmed">No dictionary data found</Text>
                          </Table.Td>
                        </Table.Tr>
                      ) : (
                        dictData.map((data) => (
                          <Table.Tr key={data.dictCode}>
                            <Table.Td>{data.dictCode}</Table.Td>
                            <Table.Td>{data.dictSort}</Table.Td>
                            <Table.Td>{data.dictLabel}</Table.Td>
                            <Table.Td>
                              <Badge variant="light">{data.dictValue}</Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={getListClassColor(data.listClass)}>
                                {data.listClass || 'default'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={data.isDefault === 'Y' ? 'green' : 'gray'} size="sm">
                                {data.isDefault === 'Y' ? 'Yes' : 'No'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={data.status === '1' ? 'green' : 'red'}>
                                {data.status === '1' ? 'Active' : 'Inactive'}
                              </Badge>
                            </Table.Td>
                            <Table.Td>{data.remark || '-'}</Table.Td>
                            <Table.Td>
                              <Group gap="xs">
                                <ActionIcon 
                                  variant="light" 
                                  color="blue"
                                  onClick={() => {
                                    setSelectedDictData(data);
                                    setDataModalOpened(true);
                                  }}
                                  title="Edit"
                                >
                                  <IconEdit size={16} />
                                </ActionIcon>
                                <ActionIcon 
                                  variant="light" 
                                  color="red"
                                  onClick={() => handleDeleteData(data.dictCode)}
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
                  
                  {dataTotal > pageSize && (
                    <Group justify="center" p="md">
                      <Pagination
                        total={Math.ceil(dataTotal / pageSize)}
                        value={dataPage}
                        onChange={setDataPage}
                      />
                    </Group>
                  )}
                </Paper>
              </>
            ) : (
              <Paper withBorder p="xl">
                <Text ta="center" c="dimmed" size="lg">
                  Please select a dictionary type from the Types tab
                </Text>
              </Paper>
            )}
          </Tabs.Panel>
        </Tabs>
      </Paper>

      {/* Modals */}
      <DictTypeModal
        opened={typeModalOpened}
        onClose={() => setTypeModalOpened(false)}
        onSuccess={() => {
          fetchDictTypes();
          setTypeModalOpened(false);
        }}
        dictType={selectedDictType}
      />

      <DictDataModal
        opened={dataModalOpened}
        onClose={() => setDataModalOpened(false)}
        onSuccess={() => {
          fetchDictData();
          setDataModalOpened(false);
        }}
        dictData={selectedDictData}
        dictType={currentDictType}
      />
    </Container>
  );
}
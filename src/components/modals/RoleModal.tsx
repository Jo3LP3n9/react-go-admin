'use client';

import { useEffect, useState } from 'react';
import { 
  Modal, 
  TextInput, 
  Select, 
  Button, 
  Group, 
  Stack, 
  Textarea, 
  NumberInput,
  Tabs,
  Checkbox,
  ScrollArea,
  Text,
  Divider,
  ActionIcon
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/lib/api/client';
import { IconChevronRight, IconChevronDown, IconFolder, IconFile } from '@tabler/icons-react';

interface RoleFormData {
  roleId?: number;
  roleName: string;
  roleKey: string;
  roleSort: number;
  status: string;
  dataScope?: string;
  remark?: string;
  menuIds?: number[];
}

interface RoleModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  role?: any;
}

interface MenuItem {
  menuId: number;
  menuName: string;
  title?: string;
  parentId?: number;
  menuType?: string;
  children?: MenuItem[];
}

export function RoleModal({ opened, onClose, onSuccess, role }: RoleModalProps) {
  const isEdit = !!role;
  const [activeTab, setActiveTab] = useState<string | null>('basic');
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const [checkedMenus, setCheckedMenus] = useState<Set<number>>(new Set());
  const [expandedMenus, setExpandedMenus] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);
  
  const form = useForm<RoleFormData>({
    initialValues: {
      roleName: '',
      roleKey: '',
      roleSort: 0,
      status: '1',
      dataScope: '1',
      remark: '',
      menuIds: [],
    },
    validate: {
      roleName: (value) => (!value ? 'Role name is required' : null),
      roleKey: (value) => {
        if (!value) return 'Role key is required';
        if (!/^[a-zA-Z0-9_]{2,20}$/.test(value)) {
          return 'Role key: 2-20 characters, letters, numbers, underscore only';
        }
        return null;
      },
      roleSort: (value) => (value < 0 ? 'Sort order must be positive' : null),
    },
  });

  // Fetch menu tree
  const fetchMenuTree = async () => {
    try {
      const response = await apiClient.get('/admin/sys/sys-menu');
      if (response.data.code === 200) {
        setMenuTree(response.data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch menu tree:', error);
    }
  };

  // Fetch role menus when editing
  const fetchRoleMenus = async (roleId: number) => {
    try {
      const response = await apiClient.get(`/admin/sys/sys-menu/role-menu-tree-select/${roleId}`);
      if (response.data.code === 200) {
        const menuIds = response.data.data?.checkedKeys || [];
        setCheckedMenus(new Set(menuIds));
      }
    } catch (error) {
      console.error('Failed to fetch role menus:', error);
    }
  };

  useEffect(() => {
    if (opened) {
      fetchMenuTree();
      
      if (role) {
        form.setValues({
          roleId: role.roleId,
          roleName: role.roleName,
          roleKey: role.roleKey || '',
          roleSort: role.roleSort || 0,
          status: role.status || '1',
          dataScope: role.dataScope || '1',
          remark: role.remark || '',
        });
        fetchRoleMenus(role.roleId);
      } else {
        form.reset();
        setCheckedMenus(new Set());
      }
    }
  }, [role, opened]);

  const handleSubmit = async (values: RoleFormData) => {
    setLoading(true);
    try {
      const data = {
        ...values,
        menuIds: Array.from(checkedMenus),
      };

      let response;
      if (isEdit) {
        response = await apiClient.put(`/admin/sys/sys-role/${role.roleId}`, data);
      } else {
        response = await apiClient.post('/admin/sys/sys-role', data);
      }

      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: `Role ${isEdit ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
        onClose();
        form.reset();
        setCheckedMenus(new Set());
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
    } finally {
      setLoading(false);
    }
  };

  // Toggle menu check
  const handleMenuCheck = (menuId: number, checked: boolean) => {
    const newChecked = new Set(checkedMenus);
    if (checked) {
      newChecked.add(menuId);
    } else {
      newChecked.delete(menuId);
    }
    setCheckedMenus(newChecked);
  };

  // Toggle expand/collapse
  const toggleExpand = (menuId: number) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuId)) {
      newExpanded.delete(menuId);
    } else {
      newExpanded.add(menuId);
    }
    setExpandedMenus(newExpanded);
  };

  // Check/uncheck all
  const handleCheckAll = (checked: boolean) => {
    if (checked) {
      const allIds = new Set<number>();
      const collectIds = (menus: MenuItem[]) => {
        menus.forEach(menu => {
          allIds.add(menu.menuId);
          if (menu.children) {
            collectIds(menu.children);
          }
        });
      };
      collectIds(menuTree);
      setCheckedMenus(allIds);
    } else {
      setCheckedMenus(new Set());
    }
  };

  // Expand/collapse all
  const handleExpandAll = (expand: boolean) => {
    if (expand) {
      const allIds = new Set<number>();
      const collectIds = (menus: MenuItem[]) => {
        menus.forEach(menu => {
          if (menu.children && menu.children.length > 0) {
            allIds.add(menu.menuId);
            collectIds(menu.children);
          }
        });
      };
      collectIds(menuTree);
      setExpandedMenus(allIds);
    } else {
      setExpandedMenus(new Set());
    }
  };

  // Render menu tree recursively
  const renderMenuTree = (menus: MenuItem[], level: number = 0): JSX.Element[] => {
    return menus.map(menu => {
      const hasChildren = menu.children && menu.children.length > 0;
      const isExpanded = expandedMenus.has(menu.menuId);
      const isChecked = checkedMenus.has(menu.menuId);

      return (
        <div key={menu.menuId}>
          <Group gap="xs" style={{ paddingLeft: level * 20, paddingTop: 4, paddingBottom: 4 }}>
            {hasChildren ? (
              <ActionIcon
                size="xs"
                variant="subtle"
                onClick={() => toggleExpand(menu.menuId)}
              >
                {isExpanded ? <IconChevronDown size={14} /> : <IconChevronRight size={14} />}
              </ActionIcon>
            ) : (
              <div style={{ width: 20 }} />
            )}
            
            <Checkbox
              checked={isChecked}
              onChange={(e) => handleMenuCheck(menu.menuId, e.currentTarget.checked)}
              label={
                <Group gap={4}>
                  {hasChildren ? <IconFolder size={14} /> : <IconFile size={14} />}
                  <Text size="sm">{menu.menuName || menu.title}</Text>
                </Group>
              }
            />
          </Group>

          {hasChildren && isExpanded && (
            <div>
              {renderMenuTree(menu.children!, level + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={isEdit ? 'Edit Role' : 'Create Role'}
      size="lg"
      closeOnClickOutside={false}
    >
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="basic">Basic Info</Tabs.Tab>
          <Tabs.Tab value="permissions">Menu Permissions</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="basic" pt="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Role Name"
                placeholder="Enter role name"
                required
                {...form.getInputProps('roleName')}
              />
              
              <TextInput
                label="Role Key"
                placeholder="Enter role key (e.g., admin, user)"
                required
                disabled={isEdit}
                {...form.getInputProps('roleKey')}
              />

              <NumberInput
                label="Sort Order"
                placeholder="Enter sort order"
                min={0}
                {...form.getInputProps('roleSort')}
              />

              <Select
                label="Status"
                data={[
                  { value: '1', label: 'Active' },
                  { value: '0', label: 'Inactive' },
                ]}
                {...form.getInputProps('status')}
              />

              <Select
                label="Data Scope"
                data={[
                  { value: '1', label: 'All Data' },
                  { value: '2', label: 'Custom Data' },
                  { value: '3', label: 'Department Data' },
                  { value: '4', label: 'Department and Below' },
                  { value: '5', label: 'Self Only' },
                ]}
                {...form.getInputProps('dataScope')}
              />

              <Textarea
                label="Remark"
                placeholder="Enter remark (optional)"
                rows={3}
                {...form.getInputProps('remark')}
              />
            </Stack>
          </form>
        </Tabs.Panel>

        <Tabs.Panel value="permissions" pt="md">
          <Stack gap="md">
            <Group justify="space-between">
              <Group>
                <Button 
                  size="xs" 
                  variant="light"
                  onClick={() => handleCheckAll(true)}
                >
                  Check All
                </Button>
                <Button 
                  size="xs" 
                  variant="light"
                  onClick={() => handleCheckAll(false)}
                >
                  Uncheck All
                </Button>
              </Group>
              <Group>
                <Button 
                  size="xs" 
                  variant="light"
                  onClick={() => handleExpandAll(true)}
                >
                  Expand All
                </Button>
                <Button 
                  size="xs" 
                  variant="light"
                  onClick={() => handleExpandAll(false)}
                >
                  Collapse All
                </Button>
              </Group>
            </Group>

            <Divider />

            <ScrollArea h={400}>
              {menuTree.length === 0 ? (
                <Text c="dimmed" ta="center" py="xl">No menus available</Text>
              ) : (
                renderMenuTree(menuTree)
              )}
            </ScrollArea>

            <Text size="xs" c="dimmed">
              Selected: {checkedMenus.size} menu(s)
            </Text>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      <Group justify="flex-end" mt="md">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => form.onSubmit(handleSubmit)()} loading={loading}>
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </Group>
    </Modal>
  );
}
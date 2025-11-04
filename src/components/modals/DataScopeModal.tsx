'use client';

import { useEffect, useState } from 'react';
import {
  Modal,
  Button,
  Radio,
  Group,
  LoadingOverlay,
} from '@mantine/core';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import { DepartmentTree } from '../DepartmentTree'; // adjust path as needed

interface Department {
  deptId: number;
  deptName: string;
  children?: Department[];
}

interface Props {
  roleId: number;
  opened: boolean;
  onClose: () => void;
}

export function DataScopeModal({ roleId, opened, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [deptTree, setDeptTree] = useState<Department[]>([]);
  const [selectedDeptIds, setSelectedDeptIds] = useState<number[]>([]);
  const [scopeType, setScopeType] = useState('custom');

  const fetchDeptTree = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/sys/sys-dept/dept-tree');
      if (res.data.code === 200) {
        setDeptTree(res.data.data || []);
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Failed to load department tree',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const payload = {
        roleId,
        dataScope: scopeType,
        deptIds: selectedDeptIds,
      };
      const res = await apiClient.put('/admin/sys/sys-role/data-scope', payload);
      if (res.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Data scope updated',
          color: 'green',
        });
        onClose();
      } else {
        notifications.show({
          title: 'Error',
          message: res.data.msg || 'Update failed',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Error',
        message: 'Update failed',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    if (opened) fetchDeptTree();
  }, [opened]);

  return (
    <Modal opened={opened} onClose={onClose} title="Set Data Scope" size="lg">
      <LoadingOverlay visible={loading} />
      <Radio.Group
        label="Scope Type"
        value={scopeType}
        onChange={setScopeType}
        mb="md"
      >
        <Radio value="all" label="All Data" />
        <Radio value="custom" label="Custom Departments" />
        <Radio value="self" label="Self Only" />
      </Radio.Group>

      {scopeType === 'custom' && (
        <DepartmentTree
          data={deptTree}
          selected={selectedDeptIds}
          onChange={setSelectedDeptIds}
        />
      )}

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>Save</Button>
      </Group>
    </Modal>
  );
}
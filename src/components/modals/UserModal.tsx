'use client';

import { useEffect } from 'react';
import { Modal, TextInput, Select, Button, Group, Stack, PasswordInput, Textarea, NumberInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/lib/api/client';
import md5 from 'md5';

interface UserFormData {
  userId?: number;
  username: string;
  nickName: string;
  password?: string;
  email: string;
  phone: string;
  sex: string;
  status: string;
  roleId: number | null;
  deptId: number | null;
  postId: number | null;
  remark?: string;
}

interface UserModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
  user?: any;
  roles?: any[];
  departments?: any[];
  posts?: any[];
}

export function UserModal({ 
  opened, 
  onClose, 
  onSuccess, 
  user, 
  roles = [], 
  departments = [], 
  posts = [] 
}: UserModalProps) {
  const isEdit = !!user;
  
  const form = useForm<UserFormData>({
    initialValues: {
      username: '',
      nickName: '',
      password: '',
      email: '',
      phone: '',
      sex: '0',
      status: '1',
      roleId: null,
      deptId: null,
      postId: null,
      remark: '',
    },
    validate: {
      username: (value) => {
        if (!value) return 'Username is required';
        if (!/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
          return 'Username: 3-20 characters, letters, numbers, underscore only';
        }
        return null;
      },
      nickName: (value) => (!value ? 'Nick name is required' : null),
      password: (value) => {
        if (!isEdit && !value) return 'Password is required';
        if (value && value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
      },
      phone: (value) => {
        if (!value) return 'Phone is required';
        if (!/^\d{10,15}$/.test(value)) return 'Phone: 10-15 digits only';
        return null;
      },
    },
  });

  useEffect(() => {
    if (user && opened) {
      form.setValues({
        userId: user.userId,
        username: user.username,
        nickName: user.nickName || '',
        email: user.email || '',
        phone: user.phone || '',
        sex: user.sex || '0',
        status: user.status || '1',
        roleId: user.roleId || null,
        deptId: user.deptId || null,
        postId: user.postId || null,
        remark: user.remark || '',
        password: '', // Always empty for edit
      });
    } else if (!opened) {
      form.reset();
    }
  }, [user, opened]);

  const handleSubmit = async (values: UserFormData) => {
    try {
      const data: any = { ...values };
      
      // Hash password if provided
      if (values.password) {
        data.password = md5(values.password);
      } else {
        delete data.password;
      }

      let response;
      if (isEdit) {
        response = await apiClient.put(`/admin/sys/sys-user/${user.userId}`, data);
      } else {
        response = await apiClient.post('/admin/sys/sys-user', data);
      }

      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: `User ${isEdit ? 'updated' : 'created'} successfully`,
          color: 'green',
        });
        onSuccess();
        onClose();
        form.reset();
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
      title={isEdit ? 'Edit User' : 'Create User'}
      size="lg"
      closeOnClickOutside={false}
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="md">
          <TextInput
            label="Username"
            placeholder="Enter username (3-20 chars)"
            required
            disabled={isEdit}
            {...form.getInputProps('username')}
          />
          
          <TextInput
            label="Nick Name"
            placeholder="Enter display name"
            required
            {...form.getInputProps('nickName')}
          />

          {!isEdit ? (
            <PasswordInput
              label="Password"
              placeholder="Enter password (min 6 characters)"
              required
              {...form.getInputProps('password')}
            />
          ) : (
            <PasswordInput
              label="Password"
              placeholder="Leave empty to keep current password"
              {...form.getInputProps('password')}
            />
          )}

          <TextInput
            label="Email"
            placeholder="Enter email address"
            type="email"
            required
            {...form.getInputProps('email')}
          />

          <TextInput
            label="Phone"
            placeholder="Enter phone number (10-15 digits)"
            required
            {...form.getInputProps('phone')}
          />

          <Select
            label="Gender"
            data={[
              { value: '0', label: 'Male' },
              { value: '1', label: 'Female' },
              { value: '2', label: 'Other' },
            ]}
            {...form.getInputProps('sex')}
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
            label="Role"
            placeholder="Select role"
            data={roles.map(r => ({ 
              value: String(r.roleId), 
              label: r.roleName 
            }))}
            searchable
            clearable
            value={form.values.roleId ? String(form.values.roleId) : null}
            onChange={(value) => form.setFieldValue('roleId', value ? Number(value) : null)}
          />

          <Select
            label="Department"
            placeholder="Select department"
            data={departments.map(d => ({ 
              value: String(d.deptId), 
              label: d.deptName 
            }))}
            searchable
            clearable
            value={form.values.deptId ? String(form.values.deptId) : null}
            onChange={(value) => form.setFieldValue('deptId', value ? Number(value) : null)}
          />

          <Select
            label="Post"
            placeholder="Select post"
            data={posts.map(p => ({ 
              value: String(p.postId), 
              label: p.postName 
            }))}
            searchable
            clearable
            value={form.values.postId ? String(form.values.postId) : null}
            onChange={(value) => form.setFieldValue('postId', value ? Number(value) : null)}
          />

          <Textarea
            label="Remark"
            placeholder="Enter remark (optional)"
            rows={3}
            {...form.getInputProps('remark')}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {isEdit ? 'Update' : 'Create'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
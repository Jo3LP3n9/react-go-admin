'use client';

import { useEffect, useState } from 'react';
import { 
  Container, 
  Title, 
  Paper, 
  Group, 
  Avatar,
  Text,
  Stack,
  Grid,
  Badge,
  Divider,
  Button,
  TextInput,
  PasswordInput,
  Tabs,
  LoadingOverlay
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconShield,
  IconBuilding,
  IconBriefcase,
  IconKey,
  IconUserEdit
} from '@tabler/icons-react';
import { apiClient } from '@/lib/api/client';
import { notifications } from '@mantine/notifications';
import md5 from 'md5';

interface UserProfile {
  userId?: number;
  username?: string;
  nickName?: string;
  email?: string;
  phone?: string;
  sex?: string;
  avatar?: string;
  status?: string;
  roleId?: number;
  roleName?: string;
  deptId?: number;
  deptName?: string;
  postId?: number;
  postName?: string;
  remark?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const profileForm = useForm({
    initialValues: {
      username: '',
      nickName: '',
      email: '',
      phone: '',
      sex: '',
    },
  });

  const passwordForm = useForm({
    initialValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    validate: {
      oldPassword: (value) => (!value ? 'Please enter old password' : null),
      newPassword: (value) => {
        if (!value) return 'Please enter new password';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return 'Please confirm password';
        if (value !== values.newPassword) return 'Passwords do not match';
        return null;
      },
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/sys/sys-user/profile');
      console.log('Profile response:', response.data);
      
      if (response.data.code === 200 && response.data.data) {
        const userData = response.data.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        
        profileForm.setValues({
          username: userData.username || '',
          nickName: userData.nickName || '',
          email: userData.email || '',
          phone: userData.phone || '',
          sex: userData.sex || '',
        });
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to load profile',
          color: 'red',
        });
      }
    } catch (error: any) {
      console.error('Failed to fetch profile:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to load profile',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (values: typeof profileForm.values) => {
    setSaving(true);
    try {
      const response = await apiClient.put('/admin/sys/sys-user/profile', values);
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Profile updated successfully',
          color: 'green',
        });
        fetchProfile();
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to update profile',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to update profile',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (values: typeof passwordForm.values) => {
    setSaving(true);
    try {
      const response = await apiClient.put('/admin/sys/sys-user/profile/pwd', {
        oldPassword: md5(values.oldPassword),
        newPassword: md5(values.newPassword),
      });
      
      if (response.data.code === 200) {
        notifications.show({
          title: 'Success',
          message: 'Password changed successfully',
          color: 'green',
        });
        passwordForm.reset();
      } else {
        notifications.show({
          title: 'Error',
          message: response.data.msg || 'Failed to change password',
          color: 'red',
        });
      }
    } catch (error: any) {
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || 'Failed to change password',
        color: 'red',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container size="lg">
        <LoadingOverlay visible={true} />
      </Container>
    );
  }

  return (
    <Container size="lg">
      <Title order={2} mb="lg">User Profile</Title>
      
      <Grid>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Paper withBorder p="xl">
            <Stack align="center" gap="md">
              <Avatar
                src={user?.avatar}
                size={120}
                radius={120}
                color="blue"
              >
                <IconUser size={60} />
              </Avatar>
              <div style={{ textAlign: 'center' }}>
                <Text size="xl" fw={700}>{user?.nickName || user?.username}</Text>
                <Text size="sm" c="dimmed">@{user?.username}</Text>
              </div>
              <Group gap="xs" justify="center">
                {user?.roleName && (
                  <Badge color="blue" variant="light" leftSection={<IconShield size={14} />}>
                    {user.roleName}
                  </Badge>
                )}
                {user?.status && (
                  <Badge color={user.status === '1' ? 'green' : 'red'}>
                    {user.status === '1' ? 'Active' : 'Inactive'}
                  </Badge>
                )}
              </Group>
              <Divider w="100%" />
              <Stack gap="xs" w="100%">
                {user?.email && (
                  <Group gap="xs">
                    <IconMail size={16} />
                    <Text size="sm">{user.email}</Text>
                  </Group>
                )}
                {user?.phone && (
                  <Group gap="xs">
                    <IconPhone size={16} />
                    <Text size="sm">{user.phone}</Text>
                  </Group>
                )}
                {user?.deptName && (
                  <Group gap="xs">
                    <IconBuilding size={16} />
                    <Text size="sm">{user.deptName}</Text>
                  </Group>
                )}
                {user?.postName && (
                  <Group gap="xs">
                    <IconBriefcase size={16} />
                    <Text size="sm">{user.postName}</Text>
                  </Group>
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>
        
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder p="md">
            <Tabs defaultValue="profile">
              <Tabs.List>
                <Tabs.Tab value="profile" leftSection={<IconUserEdit size={16} />}>
                  Edit Profile
                </Tabs.Tab>
                <Tabs.Tab value="password" leftSection={<IconKey size={16} />}>
                  Change Password
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="profile" pt="md">
                <form onSubmit={profileForm.onSubmit(handleUpdateProfile)}>
                  <Stack gap="md">
                    <TextInput
                      label="Username"
                      value={user?.username || ''}
                      disabled
                    />
                    <TextInput
                      label="Nick Name"
                      placeholder="Enter your nick name"
                      {...profileForm.getInputProps('nickName')}
                    />
                    <TextInput
                      label="Email"
                      placeholder="Enter your email"
                      type="email"
                      {...profileForm.getInputProps('email')}
                    />
                    <TextInput
                      label="Phone"
                      placeholder="Enter your phone number"
                      {...profileForm.getInputProps('phone')}
                    />
                    <Group justify="flex-end" mt="md">
                      <Button type="submit" loading={saving}>
                        Update Profile
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Tabs.Panel>

              <Tabs.Panel value="password" pt="md">
                <form onSubmit={passwordForm.onSubmit(handleChangePassword)}>
                  <Stack gap="md">
                    <PasswordInput
                      label="Old Password"
                      placeholder="Enter your current password"
                      required
                      {...passwordForm.getInputProps('oldPassword')}
                    />
                    <PasswordInput
                      label="New Password"
                      placeholder="Enter your new password"
                      required
                      {...passwordForm.getInputProps('newPassword')}
                    />
                    <PasswordInput
                      label="Confirm Password"
                      placeholder="Confirm your new password"
                      required
                      {...passwordForm.getInputProps('confirmPassword')}
                    />
                    <Group justify="flex-end" mt="md">
                      <Button 
                        variant="default" 
                        onClick={() => passwordForm.reset()}
                      >
                        Reset
                      </Button>
                      <Button type="submit" loading={saving}>
                        Change Password
                      </Button>
                    </Group>
                  </Stack>
                </form>
              </Tabs.Panel>
            </Tabs>
          </Paper>
        </Grid.Col>
      </Grid>
    </Container>
  );
}

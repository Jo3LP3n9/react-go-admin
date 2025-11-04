'use client';

import { useState, useEffect } from 'react';
import { TextInput, PasswordInput, Button, Group, Box } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import md5 from 'md5';

export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [captchaInfo, setCaptchaInfo] = useState('');
  const [captchaId, setCaptchaId] = useState('');

  const form = useForm({
    initialValues: {
      username: 'admin',
      password: '123456',
      code: '',
    },
    validate: {
      username: (value) => (!value ? 'Please enter username' : null),
      password: (value) => (!value ? 'Please enter password' : null),
      code: (value) => (!value ? 'Please enter captcha' : null),
    },
  });

  const onCaptcha = async () => {
    try {
      const response = await apiClient.get('/captcha');
      const { data, code, msg } = response.data;
      
      if (code !== 200) {
        notifications.show({
          title: 'Error',
          message: msg || 'Failed to load captcha',
          color: 'red',
        });
        return;
      }
      
      setCaptchaInfo(data.data);
      setCaptchaId(data.id);
      
    } catch (error: any) {
      console.error('Failed to load captcha:', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to load captcha',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    onCaptcha();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    setLoading(true);
    
    try {
      // Hash password with MD5 before sending
      const hashedPassword = md5(values.password);
      
      const loginData = {
        username: values.username,
        password: hashedPassword,
        code: values.code,
        uuid: captchaId,
      };
      
      console.log('Login payload:', { ...loginData, password: '***' });
      
      const response = await apiClient.post('/login', loginData);
      console.log('Login response:', response.data);
      
      const { data, code, msg } = response.data;
      
      if (code !== 200) {
        notifications.show({
          title: 'Login Failed',
          message: msg || 'Login failed',
          color: 'red',
        });
        onCaptcha();
        form.setFieldValue('code', '');
        return;
      }
      
      if (data?.token) {
        // Store JWT token
        localStorage.setItem('token', data.token);
        localStorage.setItem('auth', 'true');
        
        console.log('Token stored successfully');
        
        // Get user profile
        try {
          const userResponse = await apiClient.get('/admin/sys/sys-user/profile');
          console.log('User profile response:', userResponse.data);
          
          if (userResponse.data.code === 200 && userResponse.data.data) {
            localStorage.setItem('user', JSON.stringify(userResponse.data.data));
          }
        } catch (error) {
          console.error('Failed to get user profile:', error);
        }
        
        // Get menu/routes for role-based navigation
        try {
          const menuResponse = await apiClient.get('/admin/sys/sys-menu/menu-role');
          console.log('Menu response:', menuResponse.data);
          
          if (menuResponse.data.code === 200 && menuResponse.data.data) {
            localStorage.setItem('routes', JSON.stringify(menuResponse.data.data));
          }
        } catch (error) {
          console.error('Failed to get menu:', error);
        }
        
        notifications.show({
          title: 'Success',
          message: 'Login successful! Redirecting...',
          color: 'green',
        });
        
        // Redirect to dashboard after successful login
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      } else {
        notifications.show({
          title: 'Error',
          message: 'No token received from server',
          color: 'red',
        });
      }
      
    } catch (error: any) {
      console.error('Login error:', error);
      notifications.show({
        title: 'Error',
        message: error.response?.data?.msg || error.response?.data?.message || 'Login failed',
        color: 'red',
      });
      onCaptcha();
      form.setFieldValue('code', '');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.reset();
    onCaptcha();
  };

  return (
    <Box component="form" onSubmit={form.onSubmit(handleSubmit)}>
      <TextInput
        label="Username"
        placeholder="Username: admin / test"
        required
        {...form.getInputProps('username')}
      />
      <PasswordInput
        label="Password"
        placeholder="Password: 123456"
        required
        mt="md"
        {...form.getInputProps('password')}
      />
      <Group mt="md" align="flex-end" style={{ gap: '8px' }}>
        <TextInput
          label="Captcha"
          placeholder="Enter captcha"
          required
          {...form.getInputProps('code')}
          style={{ flex: 1 }}
        />
        {captchaInfo ? (
          <img
            src={captchaInfo}
            alt="Captcha"
            onClick={onCaptcha}
            style={{ 
              cursor: 'pointer',
              width: '120px',
              height: '40px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              objectFit: 'contain',
              backgroundColor: '#f8f9fa'
            }}
            title="Click to refresh"
          />
        ) : (
          <div 
            style={{ 
              width: '120px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              backgroundColor: '#f8f9fa',
              color: '#868e96',
              fontSize: '12px'
            }}
          >
            Loading...
          </div>
        )}
      </Group>
      <Group mt="xl" grow>
        <Button variant="default" onClick={handleReset}>
          Reset
        </Button>
        <Button type="submit" loading={loading}>
          Sign in
        </Button>
      </Group>
    </Box>
  );
}

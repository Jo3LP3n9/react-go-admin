import { useEffect, useState } from 'react';

export function usePermissions() {
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    const userInfo = localStorage.getItem('user');
    if (userInfo) {
      try {
        const user = JSON.parse(userInfo);
        const perms = user.permissions || [];
        setPermissions(perms);
      } catch (error) {
        console.error('Failed to parse user permissions:', error);
      }
    }
  }, []);

  const hasPermission = (perm: string): boolean => {
    return permissions.includes(perm);
  };

  return { permissions, hasPermission };
}
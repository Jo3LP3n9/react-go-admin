'use client';

import { useEffect, useState } from 'react';
import { NavLink, ScrollArea, Stack, Text } from '@mantine/core';
import { 
  IconDashboard, 
  IconUsers, 
  IconSettings, 
  IconShield,
  IconMenu2,
  IconFileText,
  IconDatabase,
  IconKey,
  IconBriefcase,
  IconBuilding,
  IconBook,
  IconList,
  IconApi,
  IconTable,
  IconChartBar,
  IconHistory,
  IconLogin
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';

interface MenuItem {
  menuId?: number;
  menuName?: string;
  title?: string;
  icon?: string;
  path?: string;
  paths?: string;
  menuType?: string;
  visible?: string;
  children?: MenuItem[];
}

// Icon mapping
const iconMap: Record<string, any> = {
  'dashboard': IconDashboard,
  'user': IconUsers,
  'users': IconUsers,
  'setting': IconSettings,
  'settings': IconSettings,
  'role': IconShield,
  'shield': IconShield,
  'menu': IconMenu2,
  'file': IconFileText,
  'article': IconFileText,
  'database': IconDatabase,
  'key': IconKey,
  'briefcase': IconBriefcase,
  'post': IconBriefcase,
  'building': IconBuilding,
  'dept': IconBuilding,
  'book': IconBook,
  'dict': IconBook,
  'list': IconList,
  'api': IconApi,
  'table': IconTable,
  'chart': IconChartBar,
  'monitor': IconChartBar,
  'history': IconHistory,
  'log': IconHistory,
  'login': IconLogin,
};

function getIconComponent(iconName?: string): any {
  if (!iconName) return IconMenu2;
  
  const normalizedName = iconName.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const [key, IconComponent] of Object.entries(iconMap)) {
    if (normalizedName.includes(key)) {
      return IconComponent;
    }
  }
  
  return IconMenu2;
}

export function AdminSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routeList = localStorage.getItem('routes');
    
    if (routeList) {
      try {
        const routes = JSON.parse(routeList);
        console.log('Loading sidebar menu items:', routes);
        setMenuItems(routes);
      } catch (error) {
        console.error('Failed to parse routes:', error);
      }
    }
    
    setLoading(false);
  }, []);

  const renderMenuItem = (item: MenuItem, level: number = 0): JSX.Element | null => {
    // Skip hidden items or non-menu items
    if (item.visible === '0' || item.menuType === 'F') {
      return null;
    }

    const IconComponent = getIconComponent(item.icon);
    const hasChildren = item.children && item.children.length > 0;
    const itemPath = item.path || item.paths || '#';
    const isActive = pathname === itemPath || pathname.startsWith(itemPath + '/');

    // For menu items without path, just render as text
    if (!item.path && !item.paths && hasChildren) {
      return (
        <NavLink
          key={item.menuId}
          label={item.menuName || item.title || 'Unnamed'}
          leftSection={<IconComponent size={16} stroke={1.5} />}
          childrenOffset={level === 0 ? 28 : 16}
          defaultOpened={isActive}
        >
          {item.children?.map(child => renderMenuItem(child, level + 1))}
        </NavLink>
      );
    }

    // For menu items with children
    if (hasChildren) {
      return (
        <NavLink
          key={item.menuId}
          label={item.menuName || item.title || 'Unnamed'}
          leftSection={<IconComponent size={16} stroke={1.5} />}
          active={isActive}
          onClick={() => item.path && router.push(itemPath)}
          childrenOffset={level === 0 ? 28 : 16}
          defaultOpened={isActive}
        >
          {item.children?.map(child => renderMenuItem(child, level + 1))}
        </NavLink>
      );
    }

    // For leaf menu items
    return (
      <NavLink
        key={item.menuId}
        label={item.menuName || item.title || 'Unnamed'}
        leftSection={<IconComponent size={16} stroke={1.5} />}
        active={isActive}
        onClick={() => router.push(itemPath)}
      />
    );
  };

  // Static fallback menu if no routes loaded
  const staticMenu = [
    { 
      menuId: 1, 
      menuName: 'Dashboard', 
      path: '/dashboard', 
      icon: 'dashboard',
      menuType: 'C'
    },
    { 
      menuId: 2, 
      menuName: 'System Management', 
      icon: 'settings',
      menuType: 'M',
      children: [
        { 
          menuId: 21, 
          menuName: 'Users', 
          path: '/system/users', 
          icon: 'users',
          menuType: 'C'
        },
        { 
          menuId: 22, 
          menuName: 'Roles', 
          path: '/system/roles', 
          icon: 'role',
          menuType: 'C'
        },
        { 
          menuId: 23, 
          menuName: 'Menus', 
          path: '/system/menus', 
          icon: 'menu',
          menuType: 'C'
        },
      ]
    },
  ];

  const itemsToRender = menuItems.length > 0 ? menuItems : staticMenu;

  return (
    <ScrollArea h="calc(100vh - 60px)">
      <Stack gap={0}>
        {loading ? (
          <Text size="sm" c="dimmed" p="md">Loading menu...</Text>
        ) : (
          itemsToRender.map(item => renderMenuItem(item))
        )}
      </Stack>
    </ScrollArea>
  );
}

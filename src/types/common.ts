export interface PaginationParams {
  page: number;
  pageSize: number;
  total?: number;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

export interface UserProfile {
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

export interface MenuItem {
  menuId?: number;
  menuName?: string;
  title?: string;
  icon?: string;
  path?: string;
  paths?: string;
  menuType?: string;
  action?: string;
  permission?: string;
  parentId?: number;
  noCache?: boolean;
  breadcrumb?: string;
  component?: string;
  sort?: number;
  visible?: string;
  isFrame?: string;
  children?: MenuItem[];
}

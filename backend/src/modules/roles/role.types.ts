export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissionIds?: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
  permissionIds?: string[];
}

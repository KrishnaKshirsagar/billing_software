export interface CreateBrandInput {
  name: string;
  description?: string;
}

export interface UpdateBrandInput {
  name?: string;
  description?: string;
  status?: "ACTIVE" | "INACTIVE";
}

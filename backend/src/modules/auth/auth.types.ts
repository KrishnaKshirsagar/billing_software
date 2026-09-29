export interface RegisterRequest {
  shopName: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobile?: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

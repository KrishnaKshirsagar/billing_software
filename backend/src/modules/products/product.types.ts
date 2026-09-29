export interface CreateProductInput {
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brandId?: string;
  unitId: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate?: number;
  openingStock?: number;
  minimumStock?: number;
  description?: string;
}

export interface UpdateProductInput {
  name?: string;
  sku?: string;
  barcode?: string | null;
  categoryId?: string;
  brandId?: string | null;
  unitId?: string;
  purchasePrice?: number;
  sellingPrice?: number;
  gstRate?: number;
  minimumStock?: number;
  description?: string | null;
}

export interface ProductListQuery {
  search?: string;
  categoryId?: string;
  brandId?: string;
  status?: "ACTIVE" | "INACTIVE";
}

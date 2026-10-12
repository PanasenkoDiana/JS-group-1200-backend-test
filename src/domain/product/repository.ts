
import type { Product, ProductWithCategory } from "./entity.js";

export type NewProduct = Omit<Product, "id">;

export interface ProductRepository {
    getAll(
        take?: number,
        categoryId?: number,
    ): Promise<ProductWithCategory[]>;
    getById(id: number): Promise<ProductWithCategory | null>;
    createProduct(data: NewProduct): Promise<Product>;
}

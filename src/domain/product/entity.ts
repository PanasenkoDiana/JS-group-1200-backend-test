import type { Category } from "../category/entity.js";

export interface Product {
    id: number;
    name: string;
    price: number;
    image: string;
    categoryId: number;
}

export type ProductWithCategory = Product & {
    category: Category;
};

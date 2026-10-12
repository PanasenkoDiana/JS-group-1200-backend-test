import type { ProductRepository } from "../../domain/product/repository.js"; 
import type {
    CreateProductInput,
    ProductService,
} from "./product.types.js";

export function createProductService(
    repository: ProductRepository,
): ProductService {
    return {
        getProducts(take, categoryId) {
            return repository.getAll(take, categoryId);
        },

        getProductById(id) {
            return repository.getById(id);
        },

        async createProduct(input: CreateProductInput) {
            const name = input.name.trim();

            if (
                !name ||
                !Number.isInteger(input.price) || input.price <= 0 ||
                !Number.isInteger(input.categoryId) || input.categoryId <= 0
            ) {
                throw new Error("INVALID_PRODUCT_DATA");
            }

            return repository.createProduct({
                name,
                price: input.price,
                image: input.image?.trim() ?? "",
                categoryId: input.categoryId,
            });
        },
    };
}
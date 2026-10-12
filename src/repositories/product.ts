import { isStructuredError } from "@prisma/orm-postgres/utils/structured-error";
import type { ProductRepository } from "../domain/product/repository.js";

// Получаем тип подключения к базе данных
type DataBase = typeof import("../prisma/db.js").db;

export function createProductRepository(
    database: DataBase,
): ProductRepository {
    return {
        async getAll(take, categoryId) {
            // Получаем продукты вместе с их категориями
            const query = categoryId !== undefined
                ? database.orm.public.Product
                    .where({ categoryId })
                    .include("category")
                    .orderBy((product) => product.id.asc())
                : database.orm.public.Product
                    .include("category")
                    .orderBy((product) => product.id.asc());

            // Если указано ограничение, возвращаем только take продуктов
            if (take !== undefined) {
                return query.limit(take).all();
            }

            // Иначе возвращаем все продукты
            return query.all();
        },

        async getById(id) {
            // Находим продукт по id и загружаем его категорию
            return database.orm.public.Product
                .where({ id })
                .include("category")
                .first();
        },

        async createProduct(data) {
            // Отделяем categoryId от остальных полей продукта
            const { categoryId, ...fields } = data;

            try {
                // Создаём продукт и связываем его с существующей категорией
                return await database.orm.public.Product.create({
                    ...fields,
                    category: (category) =>
                        category.connect({ id: categoryId }),
                });
            } catch (error) {
                /* 
                1. Блок перехвата ошибок:
                Перехватывает абсолютно любую ошибку, возникшую в блоке try 
                (например, сбой сети, падение базы данных или ошибку валидации). 
                Переменная "error" содержит объект с информацией об этой ошибке.
                */

                // --- СЦЕНАРИЙ 1: Обработка дубликата продукта (нарушение уникальности в БД) ---
                if (
                    // Убеждаемся, что "error" — это полноценный объект ошибки JavaScript (защита от null/строк)
                    error instanceof Error &&
                    
                    /* 
                    Проверяем наличие свойства "sqlState" внутри объекта ошибки. 
                    Оно характерно для драйверов реляционных баз данных (PostgreSQL, MySQL).
                    */
                    "sqlState" in error &&
                    
                    /* 
                    Код "23505" в стандарте SQL (SQLSTATE) означает Unique Violation 
                    (попытка вставить запись, которая нарушает уникальное поле, например, дубль имени или артикула).
                    */
                    error.sqlState === "23505"
                ) {
                    /* 
                    Перехватываем техническую системную ошибку БД и заменяем её 
                    на кастомную бизнес-ошибку. Фронтенд увидит эту строку и сможет 
                    показать пользователю понятное уведомление: "Товар уже существует".
                    */
                    throw new Error("PRODUCT_ALREADY_EXISTS");
                }

                // --- СЦЕНАРИЙ 2: Обработка отсутствующей категории (ошибка связи в ORM) ---
                if (
                    /* 
                    Вызываем вспомогательную функцию проекта, которая проверяет, 
                    является ли объект ошибки структурированным объектом нашей ORM.
                    */
                    isStructuredError(error) &&
                    
                    /* 
                    Проверяем конкретный код ошибки ORM. Данный код означает, 
                    что была попытка связать сущности (например, товар с категорией), 
                    но указанной категории (с таким ID) просто не оказалось в базе данных.
                    */
                    error.code === "ORM.RELATION_ROW_MISSING"
                ) {
                    /* 
                    Скрываем внутренние детали ORM и выбрасываем понятную нашему 
                    приложению ошибку, чтобы обработчик запроса знал причину сбоя.
                    */
                    throw new Error("CATEGORY_NOT_FOUND");
                }

                /* 
                --- СЦЕНАРИЙ 3: Непредвиденные ошибки ---
                Если ошибка не подошла ни под одно из условий выше (например, 
                упал сервер, порвалось соединение с БД или баг в коде), 
                мы не "глотаем" её, а пробрасываем исходную ошибку дальше ("throw error"), 
                чтобы её залогировала система мониторинга.
                */
                throw error;
            }
        },
    };
}
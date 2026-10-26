import type { UserRepository } from "../domain/user/repository.js";

type Database = typeof import("../prisma/db.js").db;

export function createUserRepository(
  database: Database,
): UserRepository {
  return {
    async getByEmail(email) {
      return database.orm.public.User.where({ email }).first();
    },

    async getById(id) {
      return database.orm.public.User.where({ id }).first();
    },
    
    async createUser(data) {
      try {
        return await database.orm.public.User.create(data);
      } catch (error) {
        if (error instanceof Error && "sqlState" in error &&
            error.sqlState === "23505") {
          throw new Error("EMAIL_ALREADY_EXISTS");
        }
        throw error;
      }
    },
  };
}


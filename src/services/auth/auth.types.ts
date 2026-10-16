import type { PublicUser } from "../../domain/user/entity.js"; // Импорт типа публичного пользователя

// Данные для входа/регистрации (email и пароль)
export interface AuthInput {
  email: string;
  password: string;
}

// Интерфейс для хеширования и проверки паролей
export interface PasswordHasher {
  hash(password: string): Promise<string>;
  verify(hash: string, password: string): Promise<boolean>;
}

// Интерфейс для подписания токенов доступа
export interface TokenSigner {
  signAccessToken(userId: number): string;
}

// Интерфейс сервиса авторизации (регистрация и вход)
export interface AuthService {
  register(input: AuthInput): Promise<PublicUser>;
  login(input: AuthInput): Promise<{
    user: PublicUser;
    accessToken: string;
  }>;
}
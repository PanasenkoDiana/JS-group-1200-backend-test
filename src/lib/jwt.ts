import "dotenv/config"; // Загружает переменные окружения из .env
import jwt from "jsonwebtoken"; // Импортирует библиотеку для работы с JWT

const secret = process.env.JWT_ACCESS_SECRET; // Читает секретный ключ для токена из конфига
if (!secret) throw new Error("JWT_ACCESS_SECRET is not defined"); // Ошибка, если секрет не задан

export function signAccessToken(userId: number): string {
  return jwt.sign({}, secret!, { // Создает и подписывает JWT-токен с помощью секретного ключа
    algorithm: "HS256",          // Используемый алгоритм подписи
    subject: String(userId),     // ID пользователя в поле sub (преобразуется в строку)
    expiresIn: "15m",            // Время жизни токена (15 минут)
  });
}
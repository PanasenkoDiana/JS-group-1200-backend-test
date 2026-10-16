import "dotenv/config"; // Загружает переменные окружения из .env
import argon2 from "argon2"; // Импортирует библиотеку для хеширования

const pepperHex = process.env.PASSWORD_PEPPER; // Читает секретный пеппер из конфига
if (!pepperHex) throw new Error("PASSWORD_PEPPER is not defined"); // Ошибка, если пеппер не задан
const pepper = Buffer.from(pepperHex, "hex"); // Переводит хекс-строку в байты (буфер)

export function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, {
    type: argon2.argon2id, // Алгоритм Argon2id
    memoryCost: 19456,     // Объем памяти (19 МБ)
    timeCost: 2,           // Количество итераций
    parallelism: 1,        // Потоки процессора
    secret: pepper,        // Дополнительный секретный ключ (пеппер)
  });
}

export function verifyPassword(
  hash: string, password: string,
): Promise<boolean> {
  return argon2.verify(hash, password, { secret: pepper }); // Сверяет пароль с хешем с учетом пеппера
}
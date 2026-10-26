import "dotenv/config"; // Загружает переменные окружения из .env
import jwt from "jsonwebtoken"; // Импортирует библиотеку для работы с JWT

const accessSecret = process.env.JWT_ACCESS_SECRET;
const refreshSecret = process.env.JWT_REFRESH_SECRET;
if (!accessSecret) throw new Error("JWT_ACCESS_SECRET is not defined");
if (!refreshSecret) throw new Error("JWT_REFRESH_SECRET is not defined") // Ошибка, если секрет не задан

export function signAccessToken(userId: number): string {
  return jwt.sign({}, accessSecret!, { // Создает и подписывает JWT-токен с помощью секретного ключа
    algorithm: "HS256",          // Используемый алгоритм подписи
    subject: String(userId),     // ID пользователя в поле sub (преобразуется в строку)
    expiresIn: "15m",            // Время жизни токена (15 минут)
  });
}

export function signRefreshToken(userId: number): string {
  return jwt.sign({ type: "refresh" }, refreshSecret!, {
    algorithm: "HS256",
    subject: String(userId),
    expiresIn: "7d",
  });
}

export function verifyAccessToken(token: string): number {
  try {
    const payload = jwt.verify(token, accessSecret!, {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new Error();
    }
    const userId = Number(payload.sub);
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error();
    return userId;
  } catch {
    throw new Error("INVALID_ACCESS_TOKEN");
  }
}

// Проверяем refresh-токен и возвращаем ID пользователя
export function verifyRefreshToken(token: string): number {
  try {
    // Проверяем подпись и срок действия токена
    const payload = jwt.verify(token, refreshSecret!, {
      algorithms: ["HS256"], // Разрешаем алгоритм HS256
    });

    // Проверяем формат токена и его тип
    if (typeof payload === "string" ||
        typeof payload.sub !== "string" || payload.type !== "refresh") {
      throw new Error(); // Токен имеет неверный формат
    }

    // Преобразуем ID пользователя из строки в число
    const userId = Number(payload.sub);

    // Проверяем, что ID — безопасное положительное целое число
    if (!Number.isSafeInteger(userId) || userId <= 0) throw new Error();

    // Возвращаем ID пользователя
    return userId;
  } catch {
    // Выбрасываем ошибку, если проверка токена не пройдена
    throw new Error("INVALID_REFRESH_TOKEN");
  }
}

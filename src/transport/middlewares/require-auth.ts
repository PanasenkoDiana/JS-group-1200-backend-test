// Импортируем тип RequestHandler, чтобы TypeScript проверял,
// что функция соответствует формату middleware в Express
import type { RequestHandler } from "express";

// Создаём middleware, который проверяет,
// авторизован ли пользователь перед выполнением запроса
export function createRequireAuth(
  // Принимаем функцию, которая проверяет access-токен
  // и возвращает ID пользователя, если токен действителен
  verifyAccessToken: (token: string) => number,
): RequestHandler {
  // Возвращаем middleware, который выполняется при запросе
  return (req, res, next) => {

    // Получаем access-токен из cookie браузера.
    // Он нужен, чтобы подтвердить личность пользователя
    const token = req.cookies?.accessToken;

    // Проверяем, есть ли токен и является ли он строкой.
    // Если токена нет, пользователь не сможет пройти авторизацию
    if (typeof token !== "string") {
      // Отправляем статус 401 — пользователь не авторизован
      res.status(401).json({ message: "Unauthorized" });
      return; // Останавливаем выполнение middleware
    }

    try {
      // Проверяем токен и получаем ID пользователя.
      // Сохраняем ID в res.locals, чтобы следующие обработчики
      // могли узнать, какой пользователь отправил запрос
      res.locals.userId = verifyAccessToken(token);

      // Токен действителен — разрешаем продолжить обработку запроса
      next();
    } catch {
      // Если токен недействителен или истёк,
      // запрещаем доступ и возвращаем статус 401
      res.status(401).json({ message: "Unauthorized" });
    }
  };
}
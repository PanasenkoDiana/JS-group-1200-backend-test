import type { Request, Response } from "express";
import type { AuthService, AuthTokens  } from "../../services/auth/auth.types.js";
import type { AuthCredentialsRequest } from "../dto/auth/requests.js";

export interface AuthHandlers {
  register(
    req: Request<{}, {}, AuthCredentialsRequest>,
    res: Response,
  ): Promise<void>;
  login(
    req: Request<{}, {}, AuthCredentialsRequest>,
    res: Response,
  ): Promise<void>;
  refresh(req: Request, res: Response): Promise<void>;
  me(req: Request, res: Response): Promise<void>;
}

const secure = process.env.NODE_ENV === "production";

// Устанавливаем cookies с токенами авторизации
function setAuthCookies(res: Response, tokens: AuthTokens): void {
  // Сохраняем access-токен в cookie
  res.cookie("accessToken", tokens.accessToken, {
    httpOnly: true, // Запрещаем доступ к cookie через JavaScript
    secure, // Передаём cookie только через HTTPS, если secure = true
    sameSite: "lax", // Ограничиваем отправку cookie с других сайтов
    maxAge: 15 * 60 * 1000, // Время жизни — 15 минут
    path: "/", // Cookie доступна для всех путей сайта
  });

  // Сохраняем refresh-токен в cookie
  res.cookie("refreshToken", tokens.refreshToken, {
    httpOnly: true, // Запрещаем доступ к cookie через JavaScript
    secure, // Передаём cookie только через HTTPS, если secure = true
    sameSite: "lax", // Ограничиваем отправку cookie с других сайтов
    maxAge: 7 * 24 * 60 * 60 * 1000, // Время жизни — 7 дней
    path: "/auth", // Cookie отправляется только на пути /auth и вложенные пути
  });
}

export function createAuthHandlers(service: AuthService): AuthHandlers {
  return {
    async register(req, res) {
      try {
        const { email, password } = req.body;
        const user = await service.register({ email, password });
        res.status(201).json(user);
      } catch (error) {
        if (error instanceof Error &&
            error.message === "EMAIL_ALREADY_EXISTS") {
          res.status(409).json({ message: "Email already exists" });
          return;
        }
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },

    async login(req, res) {
      try {
        const { email, password } = req.body;
        const result = await service.login({ email, password });
        setAuthCookies(res, result);
        res.status(200).json({ user: result.user });
      } catch (error) {
        if (error instanceof Error && error.message === "INVALID_CREDENTIALS") {
          res.status(401).json({ message: "Invalid credentials" });
          return;
        }
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
    // Обновляем токены авторизации
    async refresh(req, res) {
      // Получаем refresh-токен из cookie
      const token = req.cookies?.refreshToken;

      // Проверяем, что токен существует и является строкой
      if (typeof token !== "string") {
        res.status(401).json({ message: "Unauthorized" }); // Возвращаем ошибку авторизации
        return; // Завершаем выполнение
      }

      try {
        // Получаем новую пару токенов
        const tokens = await service.refresh(token);

        // Сохраняем новые токены в cookie
        setAuthCookies(res, tokens);

        // Сообщаем об успешном обновлении токенов
        res.status(200).json({ message: "Tokens updated" });
      } catch (error) {
        // Проверяем, не является ли ошибка недействительным refresh-токеном
        if (error instanceof Error && error.message === "INVALID_REFRESH_TOKEN") {
          res.status(401).json({ message: "Unauthorized" }); // Возвращаем ошибку авторизации
          return; // Завершаем выполнение
        }

        // Выводим неизвестную ошибку в консоль сервера
        console.error(error);

        // Сообщаем о внутренней ошибке сервера
        res.status(500).json({ message: "Internal server error" });
      }
    },
    async me(req, res) {
      try {
        const userId: number = res.locals.userId;
        const user = await service.me(userId);
        res.status(200).json(user);
      } catch (error) {
        if (error instanceof Error && error.message === "UNAUTHORIZED") {
          res.status(401).json({ message: "Unauthorized" });
          return;
        }
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
      }
    },
  };
}

// export function createAuthHandlers(service: AuthService): AuthHandlers {
//   return {
//     async register(req, res) {
//       try {
//         // TODO: Получите email и password из req.body
//         // const { email, password } = ...;

//         // TODO: Вызовите сервис регистрации и отправьте статус 201 с созданным пользователем
//         // const user = await service.register({ email, password });
//         // res.status(201).json(user);
        
//         throw new Error("Not implemented");
//       } catch (error) {
//         if (error instanceof Error &&
//             error.message === "EMAIL_ALREADY_EXISTS") {
//           res.status(409).json({ message: "Email already exists" });
//           return;
//         }
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     },

//     async login(req, res) {
//       try {
//         // TODO: Получите email и password из req.body
//         // const { email, password } = ...;

//         // TODO: Вызовите сервис логина, запишите accessToken в cookie и отправьте ответ 200
//         // const result = await service.login({ email, password });
//         // res.cookie("accessToken", result.accessToken, { ... });
//         // res.status(200).json({ user: result.user });

//         throw new Error("Not implemented");
//       } catch (error) {
//         if (error instanceof Error &&
//             error.message === "INVALID_CREDENTIALS") {
//           res.status(401).json({ message: "Invalid credentials" });
//           return;
//         }
//         console.error(error);
//         res.status(500).json({ message: "Internal server error" });
//       }
//     },
//   };
// }
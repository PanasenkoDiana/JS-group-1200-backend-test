import type { Request, Response } from "express";
import type { AuthService } from "../../services/auth/auth.types.js";
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
        res.cookie("accessToken", result.accessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 15 * 60 * 1000,
          path: "/",
        });
        res.status(200).json({ user: result.user });
      } catch (error) {
        if (error instanceof Error &&
            error.message === "INVALID_CREDENTIALS") {
          res.status(401).json({ message: "Invalid credentials" });
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
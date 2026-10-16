import type { UserRepository } from "../../domain/user/repository.js";
import type { AuthService, PasswordHasher, TokenSigner } from "./auth.types.js";

export function createAuthService(
  repository: UserRepository,
  passwordHasher: PasswordHasher,
  tokenSigner: TokenSigner,
): AuthService {
  return {
    async register(input) {
      const email = input.email.trim().toLowerCase();
      const passwordHash = await passwordHasher.hash(input.password);
      const user = await repository.createUser({ email, passwordHash });
      return { id: user.id, email: user.email };
    },
    async login(input) {
      const email = input.email.trim().toLowerCase();
      const user = await repository.getByEmail(email);
      if (!user || !await passwordHasher.verify(user.passwordHash, input.password)) {
        throw new Error("INVALID_CREDENTIALS");
      }
      return {
        user: { id: user.id, email: user.email },
        accessToken: tokenSigner.signAccessToken(user.id),
      };
    },
  };
}
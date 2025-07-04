import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { UsePipes, ValidationPipe } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { UserInputError } from "apollo-server-express";
import { RegisterInput } from "./dto/register.input";
import { LoginInput } from "./dto/login.input";

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  // ───────────────────────────────
  // REGISTER
  // ───────────────────────────────
  @Mutation(() => String)
  @UsePipes(new ValidationPipe({ whitelist: true })) // valide via class-validator
  async register(@Args("data") data: RegisterInput): Promise<string> {
    try {
      const { access_token } = await this.auth.register(
        data.username,
        data.password
      );
      return access_token;
    } catch (e: any) {
      if (e.message?.includes("Username already taken")) {
        throw new UserInputError("Ce nom d’utilisateur est déjà pris.");
      }
      throw e;
    }
  }

  // ───────────────────────────────
  // LOGIN
  // ───────────────────────────────
  @Mutation(() => String)
  async login(@Args("data") data: LoginInput): Promise<string> {
    const { access_token } = await this.auth.login(
      data.username,
      data.password
    );
    return access_token;
  }
}

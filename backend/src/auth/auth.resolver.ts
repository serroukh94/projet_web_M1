import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { UserInputError } from "apollo-server-express";

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => String)
  async register(@Args("username") u: string, @Args("password") p: string) {
    try {
      const { access_token } = await this.auth.register(u, p);
      return access_token;
    } catch (e) {
      if (e.message.includes("Username already taken")) {
        throw new UserInputError("Ce nom d’utilisateur est déjà pris.");
      }
      throw e;
    }
  }

  @Mutation(() => String)
  async login(
    @Args("username") username: string,
    @Args("password") password: string
  ): Promise<string> {
    const { access_token } = await this.auth.login(username, password);
    return access_token;
  }
}

import { MyContext } from "src/types";
import { Resolver, Arg, Mutation, InputType, Field, Ctx } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@Resolver()
export class UserResolver {
  @Mutation(() => User)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em }: MyContext
  ): Promise<User | null> {
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await em.persistAndFlush(user);
    return user;
  }
}
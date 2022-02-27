import { MyContext } from "src/types";
import { Resolver, Arg, Mutation, InputType, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";

// declaration merging for adding own properties to expresss-session
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
}

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string
  @Field()
  password: string
}

@ObjectType()
class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {

  @Query(() => UserResponse)
  async me(
    @Ctx() { em, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null
    }

    const user = em.findOne(User, { _id: req.session.userId });
    return user
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    // username validation
    if (options.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "length must be greather than 1",
          }
        ]
      }
    }

    // password validation
    if (options.password.length < 3) {
      return {
        errors: [
          {
            field: "password",
            message: "length must be greather than 3",
          }
        ]
      }
    }
    // hash password
    const hashedPassword = await argon2.hash(options.password);

    // create user
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // check duplicate username
    try {
      await em.persistAndFlush(user);
    } catch (err) {

      // duplicate username error
      if (err.code == "23505")
        return {
          errors: [
            {
              field: "username",
              message: "username already taken",
            }
          ]
        }
    }

    req.session.userId = user._id;
    return {
      user: user,
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse | null> {
    const user = await em.findOne(User, { username: options.username }) // Username is unique
    if (!user) {
      return {
        errors: [{
          field: "username",
          message: "username doesn't exist",
        }]
      }
    }

    const validatePassword = await argon2.verify(user.password, options.password);
    if (!validatePassword) {
      return {
        errors: [
          {
            field: "password",
            message: "incorrect password",
          }
        ]
      };
    }

    req.session.userId = user._id;
    console.log(req.session.userId);

    return {
      user: user,
    };
  } 
}
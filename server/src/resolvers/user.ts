import { MyContext } from "src/types";
import { Resolver, Arg, Mutation, Field, Ctx, ObjectType, Query, FieldResolver, Root } from "type-graphql";
import argon2 from "argon2";
import { User } from "../entities/User";
import { FORGET_PASSWORD_PREFIX, __cookieName__ } from "../constants";

import { UsernamePasswordInput } from "./UsernamePasswordInput";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";

// declaration merging for adding own properties to expresss-session
declare module 'express-session' {
  export interface SessionData {
    userId: number;
  }
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

@Resolver(User)
export class UserResolver {

  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    if (req.session.userId === user.id) {
      return user.email
    }

    // current user wants to see someone else email
    return "";

  }
  
  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() {req, em, redis}: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: "newPassword",
            message: "length must be greater than 2"
          }
        ]
      }
    }

    const userId = await redis.get(FORGET_PASSWORD_PREFIX + token)
    if (!userId) {
      return {
        errors: [
          {
            field: "token",
            message: "token doesn't exist or expired"
          }
        ]
      }      
    }

    const user = await em.findOne(User, { where: { id: parseInt(userId) } })
    if (!user) {
      return {
        errors: [
          {
            field: "user",
            message: "user no longer exists"
          }
        ]
      }
    }

    user.password = await argon2.hash(newPassword);
    await em.save(user);

    await redis.del(FORGET_PASSWORD_PREFIX + token);
    // login in user
    req.session.userId = user.id;
    return {
      user: user
    }
  }

  @Mutation(() => Boolean)
  async forgetPassword(@Arg("email") email: string, @Ctx() { em, redis }: MyContext) {
    const user = await em.findOne(User, { where: { email: email } });
    if (!user) {
      // user dodesn't exist
      return true
    }
    const token = v4(); //qwewe-qwewew-123
    await redis.set(
      FORGET_PASSWORD_PREFIX + token,
      user.id,
      'ex',
      1000 * 60 * 60 * 24 * 3
    )
    
    await sendEmail(
      email,
      `<a href="http://localhost:3000/change-password/${token}">reset password</a>`
    )
    return true
  }

  @Query(() => User, { nullable: true })
  me(@Ctx() { em, req }: MyContext) {
    // you are not logged in
    if (!req.session.userId) {
      return null;
    }

    return em.findOne(User, { where: { id: req.session.userId } });
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {

    // email validation
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }
    // hash password
    const hashedPassword = await argon2.hash(options.password);

    // create user
    // const user = em.create(User, {
    //   username: options.username,
    //   password: hashedPassword,
    //   createdAt: new Date(),
    //   updatedAt: new Date()
    // });

    // check duplicate username
    let user;
    try {
      const result = await em
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: options.username,
          email: options.email,
          password: hashedPassword,
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      console.log(err);
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

    req.session.userId = user.id;
    return {
      user: user,
    }
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg('usernameOrEmail') usernameOrEmail: string,
    @Arg('password') password: string,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse | null> {
    const user = await em.findOne(User,
      usernameOrEmail.includes("@") ?
        { where: { email: usernameOrEmail }}
        : { where: { username: usernameOrEmail }}
    ) // Username is unique
    if (!user) {
      return {
        errors: [{
          field: "usernameOrEmail",
          message: "username or email doesn't exist",
        }]
      }
    }

    const validatePassword = await argon2.verify(user.password, password);
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

    req.session.userId = user.id;
    console.log(req.session);

    return {
      user: user,
    };
  } 

  @Mutation(() => Boolean)
  logout(@Ctx() {req, res}: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(__cookieName__);
        if (err) {
          console.error(err);
          resolve(false);
          return
          
        } else {
          resolve(true);
        }
      }
    ))
  }
}
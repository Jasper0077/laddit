import { Post } from "../entities/Post";
import { Resolver, Query, ObjectType, Ctx, Arg, Int, Mutation } from "type-graphql";
import { MyContext } from "src/types";
import 'reflect-metadata';

@ObjectType()
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Mutation(() => Post, {  nullable: true  })
  post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    return em.findOne(Post, { _id: id });
  }

  @Mutation(() => Post, {  nullable: true  })
  async createPost(
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, {
      title: title,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, {  nullable: true  })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    try {
      const post = await em.findOneOrFail(Post, { _id: id });
      if (typeof title !== undefined) {
        post.title = title;
        await em.persistAndFlush(post);
      }
      return post;
    } catch (e) {
      console.error('Not found', e);
      return null;
    }
  }

  @Mutation(() => Boolean)
  async deletePost(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<boolean> {
    try {
      await em.nativeDelete(Post, { _id: id });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
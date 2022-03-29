import { Post } from "../entities/Post";
import { Resolver, Query, ObjectType, Ctx, Arg, Mutation, InputType, Field, UseMiddleware, Int } from "type-graphql";
import { MyContext } from "src/types";
import 'reflect-metadata';
import { isAuth } from "../middlewares/isAuth";

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  text: string
}

@ObjectType()
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  async posts(
    @Ctx() { em }: MyContext,
    @Arg('limit', () => Int) limit: number = 50,
    @Arg('cursor', () => String, { nullable: true}) cursor: string | null
  ): Promise<Post[]> {
    const realLimit = Math.min(50, limit);
      const qb = em.createQueryBuilder(Post, "post")
        .orderBy('"created_at"', "DESC")
        .take(realLimit)
    if (cursor) {
      qb.where('"created_at" < :cursor',
        { cursor: new Date(parseInt(cursor)) });
    }
    return qb.getMany()
  }

  @Query(() => Post, {  nullable: true  })
  async post(
    @Arg("id") id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | undefined> {
    return await em.findOne(Post, { where: { id: id } });
  } 

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async createPost(
    @Arg("input") input: PostInput,
    @Ctx() { req, em }: MyContext
  ): Promise<Post | null> {
    const post = em.create(Post, {
      title: input.title,
      text: input.text,
      creatorId: req.session.userId
    })
    
    await em.save(post);
    return post;
  }

  @Mutation(() => Post, {  nullable: true  })
  async updatePost(
    @Arg("id") id: number,
    @Arg("title") title: string,
    @Ctx() { em }: MyContext
  ): Promise<Post | null> {
    try {
      const post = await em.findOneOrFail(Post, { where: { id: id } });
      if (typeof title !== undefined) {
        post.title = title;
        await em.save(post);
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
      await em.delete(Post, { _id: id });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
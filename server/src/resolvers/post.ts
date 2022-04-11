import { Post } from "../entities/Post";
import { Updoot } from "../entities/Updoot";
import { Resolver, Query, ObjectType, Ctx, Arg, Mutation, InputType, Field, UseMiddleware, Int, FieldResolver, Root } from "type-graphql";
import { MyContext } from "src/types";
import 'reflect-metadata';
import { isAuth } from "../middlewares/isAuth";
import { getConnection } from "typeorm";

@InputType()
class PostInput {
  @Field()
  title: string

  @Field()
  text: string
}

@ObjectType()
class PaginatedPosts {
  @Field(() => [Post])
  posts: Post[];
  @Field()
  hasMore: boolean;
}

@ObjectType()
@Resolver(Post)
export class PostResolver {
  @FieldResolver(() => String)
  textSnippet(
    @Root() root: Post
  ) {
    return root.text.slice(0, 50);
  }

  @Mutation(() => Boolean)
  async vote(
    @Arg('postId', () => Int) postId: number,
    @Arg('value', () => Int) value: number,
    @Ctx() { req }: MyContext
  ) {
    const { userId } = req.session;
    const isUpdoot = value !== -1;
    const voteValue = isUpdoot ? 1 : -1
    await Updoot.insert({
      userId,
      postId,
      value: voteValue
    })
    getConnection().query(
      `
        START TRANSACTION;

        insert into updoot ("userId", "postId", value)
        values (${userId},${postId},${value});

        update post
        set points = points + ${voteValue}
        where id = ${postId};

        COMMIT;
      `)
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    // @Ctx() { em }: MyContext,
    @Arg('limit', () => Int) limit: number = 50,
    @Arg('cursor', () => String, { nullable: true}) cursor: string | null
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    // Use raw query instead, query builder is broken with combined property.
    if (cursor) {
      replacements.push(new Date(parseInt(cursor)))
    }
    const posts = await getConnection().query(
      `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email
    ) creator
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."created_at" < $2` : ""}
    order by p."created_at" DESC
    limit $1
    `,
      replacements
    );
    // const qb = em.createQueryBuilder(Post, "post")
    //     .innerJoinAndSelect("post.creator", "u", 'u.id = post."creatorId"')
    //     .orderBy('post."created_at"', "DESC")
    //     .take(realLimitPlusOne)
    // if (cursor) {
    //   qb.where('post."created_at" < :cursor',
    //     { cursor: new Date(parseInt(cursor)) });
    // }

    // const posts = await qb.getMany();
    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }
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
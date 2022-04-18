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
    const updoot = await Updoot.findOne({ where: { postId, userId } })
    if (updoot && updoot.value !== voteValue) {
      getConnection().transaction(async (tm) => {
        await tm.query(`
          update updoot
          set value = $3
          where "postId" = $1 and "userId" = $2;
        `, [postId, userId, value])

        await tm.query(`
          update post
          set points = points + $1
          where id = $2;
        `, [2 * voteValue, postId])
      })
    } else if (!updoot) {
      // user has never vote before
      getConnection().transaction(async (tm) => {
        await tm.query(`
          insert into updoot ("userId", "postId", value)
          values ($1, $2, $3);
        `, [userId, postId, value])

        await tm.query(`
          update post
          set points = points + $1
          where id = $2;
        `, [voteValue, postId])
      })
    }
    return true;
  }

  @Query(() => PaginatedPosts)
  async posts(
    @Arg('limit', () => Int) limit: number,
    @Arg('cursor', () => String, { nullable: true }) cursor: string | null,
    @Ctx() { req }: MyContext
  ): Promise<PaginatedPosts> {
    const realLimit = Math.min(50, limit);
    const realLimitPlusOne = realLimit + 1;
    const replacements: any[] = [realLimitPlusOne];

    // if user is logged in
    if (req.session.userId) {
      replacements.push(req.session.userId);
    }

    // Use raw query instead, query builder is broken with combined property.
    let cursorIdx = 3;
    if (cursor) {
      replacements.push(new Date(cursor))
      cursorIdx = replacements.length;
    }
    console.log("cursor: ", cursor);
    console.log("userId: ", req.session.userId);
    const posts = await getConnection().query(
      `
    select p.*,
    json_build_object(
      'id', u.id,
      'username', u.username,
      'email', u.email,
      'created_at', u."created_at",
      'updated_at', u."updated_at"
    ) creator,
    ${req.session.userId
      ? `(select value from updoot where "userId" = $2 and "postId" = p.id) as "voteStatus"`
      : `null as "voteStatus"`
    }
    from post p
    inner join public.user u on u.id = p."creatorId"
    ${cursor ? `where p."created_at" < $${ cursorIdx }` : ""}
    order by p."created_at" DESC
    limit $1
    `,
      replacements
    );
    // const posts = await getConnection().query(
    //     `
    //   select *
    //   from post
    //   ${cursor ? `where created_at < $2` : ""}
    //   order by created_at DESC
    //   limit $1
    //   `,
    //     replacements
    // );
    // const qb = em.createQueryBuilder(Post, "post")
    //     .innerJoinAndSelect("post.creator", "u", 'u.id = post."creatorId"')
    //     .orderBy('post."created_at"', "DESC")
    //     .take(realLimitPlusOne)
    // if (cursor) {
    //   qb.where('post."created_at" < :cursor',
    //     { cursor: new Date(parseInt(cursor)) });
    // }

    // const posts = await qb.getMany();
    console.log("posts: ", posts);
    return { posts: posts.slice(0, realLimit), hasMore: posts.length === realLimitPlusOne }
  }

  @Query(() => Post, {  nullable: true  })
  async post(
    @Arg("id", () => Int) id: number,
    @Ctx() { em }: MyContext
  ): Promise<Post | undefined> {
    return await em.findOne(Post, { where: { id: id }, relations: ["creator"] });
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

  @Mutation(() => Post, { nullable: true })
  @UseMiddleware(isAuth)
  async updatePost(
    @Arg("id", () => Int) id: number,
    @Arg("title") title: string,
    @Arg("text") text: string,
    @Ctx() { req }: MyContext
  ): Promise<Post | null> {
    // try {
    //   const post = await em.findOneOrFail(Post, { where: { id: id } });
    //   if (typeof title !== undefined) {
    //     post.title = title;
    //     post.text = text;
    //     await em.save(post);
    //   }
    //   return post;
    // } catch (e) {
    //   console.error('Not found', e);
    //   return null;
    // }

    // user has to be the creator
    const result = await getConnection()
      .createQueryBuilder()
      .update(Post)
      .set({ title, text })
      .where('id = :id and creatorId = :creatorId', { id, creatorId: req.session.userId })
      .returning("*")
      .execute();
    
    return result.raw[0];
  }

  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deletePost(
    @Arg("id", () => Int) id: number,
    @Ctx() { req, em }: MyContext
  ): Promise<boolean> {
        // not cascade way
    // const post = await Post.findOne(id);
    // if (!post) {
    //   return false;
    // }
    // if (post.creatorId !== req.session.userId) {
    //   throw new Error("not authorized");
    // }

    // await Updoot.delete({ postId: id });
    // await Post.delete({ id });

    try {
      await em.delete(Post, { id, creatorId: req.session.userId });
      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}
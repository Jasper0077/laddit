import { Post } from "../../entities/Post";
import { Resolver, Query, ObjectType, Ctx } from "type-graphql";
import { MyContext } from "src/types";

@ObjectType()
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }
}
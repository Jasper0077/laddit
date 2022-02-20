import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroORM from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./migrations/resolvers/hello";
import { PostResolver } from "./migrations/resolvers/post";

const main = async () => {
  const orm = await MikroORM.init(mikroORM);
  const migrator = orm.getMigrator();
  // const post = orm.em.create(Post, {
  //   createdAt: new Date(),
  //   title: "my first post",
  //   updatedAt: new Date()
  // });

  await migrator.up();
  // await orm.em.persistAndFlush(post);
  // await orm.close(true);

  const app = express();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver],
      validate: false
    }),
    context: () => ({ em: orm.em })
  });

  await apolloServer.start();
  apolloServer.applyMiddleware({ app });

  app.get('/', (_, res) => {
    res.send("Hello world!");
  });

  app.listen(4000, () => {
    console.log("server is up on localhost:4000");
  });
}

console.log("Test");
main().catch(err => {
  console.error(err);
});
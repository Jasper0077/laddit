import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroORM from "./mikro-orm.config";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";

import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import Redis from "ioredis";

import { createServer } from "http";

// const { createClient } = require("redis");
const RedisStore = connectRedis(session)
const redisClient = new Redis({
  host: "127.0.0.1",
  port: 6379
});

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

  app.set("trust proxy", true);

  app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient, 
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        httpOnly: true,
        sameSite: "none",
        // secure: __prod__
        secure: true
      },
      saveUninitialized: false,
      secret: "somerandomstring123456",
      resave: false,
    })
  )

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  const corsOptions = {
    credentials: true,
    origin: "https://studio.apollographql.com"
  }
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: corsOptions });

  app.get('/', (_, res) => {
    res.send("Hello world!");
  });

  // app.listen(4000, () => {
  //   console.log("server is up on localhost:4000");
  // });

  const httpServer = createServer(app);
  httpServer.listen(4000, () => {
    console.log("Server is up on port 4000");
  });
}

console.log("Test");
main().catch(err => {
  console.error(err);
});
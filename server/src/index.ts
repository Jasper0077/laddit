import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { isLocalhost, __cookieName__, __prod__ } from "./constants";
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
// import Redis from "ioredis";

import cors from "cors";
import { createServer } from "http";

// const { createClient } = require("redis");
const RedisStore = connectRedis(session)
// const redisClient = new Redis({
//   host: "127.0.0.1",
//   port: 6379
// });
const { createClient } = require("redis");

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
  let redisClient = createClient({ legacyMode: true });
  redisClient.on("connect", () => console.log("Connected to Redis!"));
  redisClient.on("error", (err: Error) =>
    console.log("Redis Client Error", err)
  );
  redisClient.connect();

  app.use(
    cors({
      origin: isLocalhost? "http://localhost:3000" : "https://studio.apollographql.com",
      credentials: true
    }),
    session({
      name: __cookieName__,
      store: new RedisStore({
        client: redisClient, 
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
        // maxAge: 10,
        httpOnly: true,
        sameSite: isLocalhost? "lax" : "none",
        // secure: __prod__
        secure: isLocalhost? false : true // http -> false, https -> true
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
    origin: isLocalhost? "http://localhost:3000" : "https://studio.apollographql.com"
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
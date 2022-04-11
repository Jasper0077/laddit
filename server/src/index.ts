import "reflect-metadata";
import { isLocalhost, __cookieName__, __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import path from "path";
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";
import Redis from "ioredis";

import cors from "cors";
import { createServer } from "http";
import { createConnection } from "typeorm";
import { Post } from "./entities/Post";
import { User } from "./entities/User";
import { Updoot } from "./entities/Updoot";

const RedisStore = connectRedis(session)
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379
});

// rerun
const main = async () => {
  const conn = await createConnection({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "postgres",
    password: "123456",
    database: "laddit",
    logging: true,
    synchronize: true,
    migrations: [path.join(__dirname, "./migrations/*")],
    entities: [Post, User, Updoot]
  })

  // await conn.runMigrations();

  const app = express();

  app.set("trust proxy", true);

  app.use(
    cors({
      origin: isLocalhost? "http://localhost:3000" : "https://studio.apollographql.com",
      credentials: true
    }),
    session({
      name: __cookieName__,
      store: new RedisStore({
        client: redis, 
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
    context: ({ req, res }): MyContext => ({ em: conn.manager, req, res, redis })
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
import { MikroORM } from "@mikro-orm/core"
import { __prod__, __postgreURL__ } from "./constants"
import { Post } from "./entities/Post"
import path from 'path'

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    glob: '!(*.d).{js,ts}',
    disableForeignKeys: true,
  },
  entities: [Post],
  type: 'postgresql',
  dbName: process.env.DATABASE_NAME,
  host: process.env.DATABASE_HOST,
  port: 5432,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  allowGlobalContext: true,
  debug: !__prod__
    
} as Parameters<typeof MikroORM.init>[0]
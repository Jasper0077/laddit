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
  dbName: 'laddit',
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '123456',
  allowGlobalContext: true,
  debug: !__prod__
    
} as Parameters<typeof MikroORM.init>[0]
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
  dbName: process.env.MIKRO_ORM_DATABASE,
  host: process.env.MIKRO_ORM_HOST,
  port: 5432,
  user: process.env.MIKRO_ORM_USER,
  password: process.env.MIKRO_ORM_PASSWORD,
  allowGlobalContext: true,
  debug: !__prod__
    
} as Parameters<typeof MikroORM.init>[0]
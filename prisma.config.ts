import { defineConfig } from 'prisma/config'
import dotenv from 'dotenv'

dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL || 'file:./prisma/dev.db'

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  datasource: {
    url: DATABASE_URL,
  },
  migrate: {
    datasourceUrl: DATABASE_URL,
  },
})

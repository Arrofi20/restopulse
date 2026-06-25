import { defineConfig } from 'prisma/config'

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
  migrate: {
    datasourceUrl: process.env.DATABASE_URL || 'file:./prisma/dev.db',
  },
})

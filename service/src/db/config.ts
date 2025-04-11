import { createConnection } from "mysql2/promise"

export interface DBConfig {
    host: string
    user: string
    password: string
    database: string
    port: number
}

export const dbConfig: DBConfig = {
    host: process.env.DB_HOST!,
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    database: process.env.DB_NAME!,
    port: +process.env.DB_PORT!
}

export const conn = await createConnection(dbConfig)

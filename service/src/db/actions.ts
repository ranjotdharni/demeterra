import { createConnection, FieldPacket, QueryError, QueryResult } from "mysql2/promise"
import { GenericError } from "@/lib/types/general"
import { newError } from "@/lib/utils/general"
import { Session } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import { dbConfig } from "./config"

export async function dbCreateSession(username: string): Promise<Session[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "DELETE FROM Session WHERE username = ?"
        let params: (string | number)[] = [username]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Create Session")
        }

        query = "INSERT INTO Session (username, token) VALUES (?, ?)"
        params = [username, uuidv4()]
        response = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Create Session")
        }

        query = "SELECT * FROM Session WHERE username = ?"
        params = [username]
        response = await conn.execute<Session[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Create Session")
        }

        conn.end()
        return response[0] as Session[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Create Session")
    }
}

export async function dbGetSession(username: string, token: string): Promise<Session[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Session WHERE username = ? AND token = ?"
        let params: (string | number)[] = [username, token]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Session[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Create Session")
        }

        conn.end()
        return response[0] as Session[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Session")
    }
}

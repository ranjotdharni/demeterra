import { createConnection, FieldPacket, QueryError, QueryResult } from "mysql2/promise"
import { Session, Location, Employee } from "@/lib/types/db"
import { GenericError } from "@/lib/types/general"
import { newError } from "@/lib/utils/general"
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

export async function dbGetLocations(): Promise<Location[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Location ORDER BY dateCreated ASC"
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Location[]>(query)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Locations")
        }

        conn.end()
        return response[0] as Location[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Locations")
    }
}

export async function dbAddLocation(name: string): Promise<Location[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        const locationId: string = uuidv4()

        let query: string = "INSERT INTO Location (locationId, name) VALUES (?, ?)"
        let params: (string | number)[] = [locationId, name]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Add Location")
        }

        query = "SELECT * FROM Location WHERE locationId = ?"
        params = [locationId]
        response = await conn.execute<Location[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Location after adding")
        }

        conn.end()
        return response[0] as Location[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Add Location")
    }
}

export async function dbGetEmployees(): Promise<Employee[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Employee ORDER BY dateCreated ASC"
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Employee[]>(query)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Employees")
        }

        conn.end()
        return response[0] as Employee[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Employees")
    }
}

export async function dbAddEmployee(name: string): Promise<Employee[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        const employeeId: string = uuidv4()

        let query: string = "INSERT INTO Employee (employeeId, name) VALUES (?, ?)"
        let params: (string | number)[] = [employeeId, name]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Add Employee")
        }

        query = "SELECT * FROM Employee WHERE employeeId = ?"
        params = [employeeId]
        response = await conn.execute<Location[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Employee after adding")
        }

        conn.end()
        return response[0] as Employee[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Add Employee")
    }
}

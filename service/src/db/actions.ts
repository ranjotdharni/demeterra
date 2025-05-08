import { Connection, createConnection, FieldPacket, QueryError, QueryResult, ResultSetHeader } from "mysql2/promise"
import { GenericError, GenericSuccess } from "@/lib/types/general"
import { Session, Location, Employee, Job, JobSummary, RawJobSummary, Note } from "@/lib/types/db"
import { newError, newSuccess, parseRawJobSummaries } from "@/lib/utils/general"
import { dateToEndOfDay, dateToSQLDate } from "@/lib/utils/db"
import { v4 as uuidv4 } from "uuid"
import { dbConfig } from "./config"

// Sessions
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

export async function dbClearSession(username: string, token: string): Promise<GenericSuccess | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "DELETE FROM Session WHERE username = ? AND token = ?"
        let params: (string | number)[] = [username, token]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Clear Session")
        }

        conn.end()
        return newSuccess("Session Cleared")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Clear Session")
    }
}

// Locations
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

export async function dbGetLocationById(locationId: string): Promise<Location[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Location WHERE locationId = ?"
        let params: (string | number)[] = [locationId]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Location[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Location by ID")
        }

        conn.end()
        return response[0] as Location[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Location by ID")
    }
}

export async function dbGetLocationsById(locations?: string[]): Promise<Location[] | GenericError> {
    if (!locations || locations.length === 0)
        return await dbGetLocations()

    const locationArrayString = `(${locations.map(loc => `'${loc}'`).join(",")})`
    const conn = await createConnection(dbConfig)

    try {
        let query: string = `SELECT * FROM Location WHERE locationId IN ${locationArrayString}`
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Location[]>(query)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Locations by IDs")
        }

        conn.end()
        return response[0] as Location[]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Locations by IDs")
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

// Employees
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

// Jobs
export async function dbGetJobsByLocation(locationId: string): Promise<Job[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Job WHERE locationId = ?"
        let params: (string | number)[] = [locationId]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Job[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Jobs")
        }

        conn.end()
        return response[0] as Job[]
    }
    catch (error) {
        console.log(error)
        return newError("Faied to Retrieve Jobs")
    }
}

export async function dbGetJobSummariesByLocation(locationId: string): Promise<JobSummary[] | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT Job.jobId as jobId, Job.dateOf as dateOf, Job.hoursWorked as hoursWorked, Job.rideCost as rideCost, Job.wage as wage, Employee.employeeId as employeeId, Employee.name as employeeName, Employee.dateCreated as employeeDateCreated, Location.locationId as locationId, Location.name as locationName, Location.dateCreated as locationDateCreated FROM Job JOIN Employee ON Job.employeeId = Employee.employeeId JOIN Location ON Job.locationId = Location.locationId WHERE Job.locationId = ? ORDER BY Job.dateOf"
        let params: (string | number)[] = [locationId]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<RawJobSummary[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Jobs Summary")
        }

        conn.end()
        return parseRawJobSummaries(response[0] as RawJobSummary[])
    }
    catch (error) {
        console.log(error)
        return newError("Faied to Retrieve Jobs Summary")
    }
}

export async function dbGetJobSummariesByLocationsAndDates(locations?: string[], from?: Date, to?: Date): Promise<JobSummary[] | GenericError> {
    let locationArrayString = `(${locations?.map(loc => `'${loc}'`).join(",")})`
    let params: (string | number)[] = []

    // Had to do this this way because this function would just keep recognizing input parameters as defined even when they were explicitly undefined, idk
    let fromValid = false
    let toValid = false

    const conn = await createConnection(dbConfig)

    try {
        if (from && from !== undefined) {
            try {
                const dateResult = dateToSQLDate(from)
                params.push(dateResult)
                fromValid = true
            }
            catch (error) {
                // do nothing
            }
        }

        if (to && to !== undefined) {
            try {
                const dateResult = dateToSQLDate(dateToEndOfDay(to))
                params.push(dateResult)
                toValid = true
            }
            catch (error) {
                // do nothing
            }
        }

        let searchConfig = ((!locations || locations.length === 0) && !fromValid && !toValid ? "" : ` WHERE${locations && locations.length !== 0 ? ` Job.locationId IN ${locationArrayString}` : ""}${fromValid ? ` ${locations && locations.length !== 0 ? "AND " : ""}Job.dateOf >= ?` : ""}${toValid ? ` ${fromValid || (locations && locations.length !== 0) ? "AND " : ""}Job.dateOf <= ?` : ""}`)
        let query: string = `SELECT Job.jobId as jobId, Job.dateOf as dateOf, Job.hoursWorked as hoursWorked, Job.rideCost as rideCost, Job.wage as wage, Employee.employeeId as employeeId, Employee.name as employeeName, Employee.dateCreated as employeeDateCreated, Location.locationId as locationId, Location.name as locationName, Location.dateCreated as locationDateCreated FROM Job JOIN Employee ON Job.employeeId = Employee.employeeId JOIN Location ON Job.locationId = Location.locationId${searchConfig} ORDER BY Job.dateOf`

        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<RawJobSummary[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Retrieve Jobs Summaries by Locations and Dates")
        }

        conn.end()
        return parseRawJobSummaries(response[0] as RawJobSummary[])
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Retrieve Jobs Summaries by Locations and Dates")
    }
}

export async function dbAddJob(job: Job, connection?: Connection): Promise<GenericSuccess | GenericError> {
    const conn = connection ? connection : await createConnection(dbConfig)

    try {
        let query: string = "INSERT INTO Job (jobId, locationId, employeeId, dateOf, hoursWorked, rideCost, wage) VALUES (?, ?, ?, ?, ?, ?, ?)"
        let params: (string | number)[] = [job.jobId, job.locationId, job.employeeId, dateToSQLDate(job.dateOf), job.hoursWorked, job.rideCost, job.wage]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Add Job(s)")
        }

        if (!connection)
            conn.end()
        return newSuccess("Added Job Successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Add Job(s)")
    }
}

export async function dbModifyJob(job: Job, connection?: Connection): Promise<GenericSuccess | GenericError> {
    const conn = connection ? connection : await createConnection(dbConfig)

    try {
        let query: string = "UPDATE Job SET dateOf = ?, hoursWorked = ?, rideCost = ?, wage = ? WHERE jobId = ?"
        let params: (string | number)[] = [dateToSQLDate(job.dateOf), job.hoursWorked, job.rideCost, job.wage, job.jobId]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Modify Job(s)")
        }
        
        if (((response as [QueryResult, FieldPacket[]])[0] as ResultSetHeader).affectedRows === 0) 
            return await dbAddJob(job, connection)

        if (!connection)
            conn.end()
        return newSuccess("Modified Job Successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Modify Job(s)")
    }
}

export async function dbRemoveJob(job: Job, connection?: Connection): Promise<GenericSuccess | GenericError> {
    const conn = connection ? connection : await createConnection(dbConfig)

    try {
        let query: string = "DELETE FROM Job WHERE jobId = ?"
        let params: (string | number)[] = [job.jobId]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Remove Job(s)")
        }

        if (!connection)
            conn.end()
        return newSuccess("Removed Job Successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Remove Job(s)")
    }
}

export async function dbAddModifyRemoveJobs(add: Job[], modify: Job[], remove: Job[]): Promise<GenericSuccess | GenericError> {
    const conn = await createConnection(dbConfig)
    let successes: GenericSuccess[] = []
    let failures: GenericError[] = []

    try {
        // add
        for (let adding of add) {
            let result: GenericSuccess | GenericError = await dbAddJob(adding, conn)

            if ((result as GenericError).error)
                failures.push(result as GenericError)

            if ((result as GenericSuccess).success)
                successes.push(result as GenericSuccess)
        }

        if (failures.length !== 0)
            console.log(`Failures (Add):\n${failures}`)

        if (add.length !== 0 && successes.length === add.length)
            console.log("All to-be Added Jobs Added Successfully")

        failures = []
        successes = []

        // modify
        for (let modifying of modify) {
            let result: GenericSuccess | GenericError = await dbModifyJob(modifying, conn)

            if ((result as GenericError).error)
                failures.push(result as GenericError)

            if ((result as GenericSuccess).success)
                successes.push(result as GenericSuccess)
        }

        if (failures.length !== 0)
            console.log(`Failures (Modify):\n${failures}`)

        if (modify.length !== 0 && successes.length === modify.length)
            console.log("All to-be Modified Jobs Modified Successfully")

        failures = []
        successes = []

        // delete
        for (let removing of remove) {
            let result: GenericSuccess | GenericError = await dbRemoveJob(removing, conn)

            if ((result as GenericError).error)
                failures.push(result as GenericError)

            if ((result as GenericSuccess).success)
                successes.push(result as GenericSuccess)
        }

        if (failures.length !== 0)
            console.log(`Failures (Remove):\n${failures}`)

        if (remove.length !== 0 && successes.length === remove.length)
            console.log("All to-be Removed Jobs Removed Successfully")

        conn.end()
        return newSuccess("Database Updated")
    }
    catch (error) {
        console.log(error)
        return newError("INTERNAL SERVER ERROR")
    }
}

// Notes
export async function dbGetNotes(): Promise<GenericError | Note[]> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "SELECT * FROM Note"
        let response: [Note[], FieldPacket[]] | QueryError = await conn.execute<Note[]>(query)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Get Note(s)")
        }

        return (response as [Note[], FieldPacket[]])[0]
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Get Note(s)")
    }
}

export async function dbCreateNote(content: string, dateOf: Date): Promise<GenericError | GenericSuccess> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "INSERT INTO Note (noteId, content, dateOf) VALUES (?, ?, ?)"
        let params: (string | number)[] = [uuidv4(), content, dateToSQLDate(dateOf)]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<QueryResult>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Create Note(s)")
        }

        return newSuccess("Note(s) Created Successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Create Note(s)")
    }
}

export async function dbEditNote(id: string, content: string): Promise<GenericError | GenericSuccess> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "UPDATE Note SET content = ? WHERE noteId = ?"
        let params: (string | number)[] = [content, id]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Note[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Update Note(s)")
        }

        return newSuccess("Note(s) Updated successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Update Note(s)")
    }
}

export async function dbDeleteNote(id: string): Promise<GenericSuccess | GenericError> {
    const conn = await createConnection(dbConfig)

    try {
        let query: string = "DELETE FROM Note WHERE noteId = ?"
        let params: (string | number)[] = [id]
        let response: [QueryResult, FieldPacket[]] | QueryError = await conn.execute<Note[]>(query, params)

        if (((response as unknown) as QueryError).code !== undefined) {
            console.log(response)
            return newError("Failed to Delete Note(s)")
        }

        return newSuccess("Note(s) Deleted successfully")
    }
    catch (error) {
        console.log(error)
        return newError("Failed to Delete Note(s)")
    }
}

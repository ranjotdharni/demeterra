import { JobViewProps } from "@/app/components/job/JobView"
import { GenericError } from "../types/general"
import { DateGroupedJobSummaries, Employee, JobSummary, Location } from "../types/db"
import { dbGetEmployees, dbGetJobSummariesByLocation, dbGetLocationById } from "@/db/actions"
import { groupJobSummariesByDate } from "./general"

/**
 * Convert TypeScript Date object to a MySQL DATETIME string.
 *
 * @example
 * ```typescript
 * dateToSQLDate(new Date());
 * ```
 *
 * @param date - The Date object to convert
 * @returns String in 'YYYY-MM-DD hh:mm:ss' format.
 */
export function dateToSQLDate(date: Date | string): string {
    const result = new Date(date)
    // calling ISOString on Date object here may be a bug, check here if client dates do not align with database!!!
    return result.toISOString().slice(0, 19).replace('T', ' ')
}

export async function fetchJobViewProps(locationId: string): Promise<JobViewProps | GenericError> {
    const locationResult: Location[] | GenericError = await dbGetLocationById(locationId)
    
    if ((locationResult as GenericError).error || (locationResult as Location[]).length === 0)
        return { error: true, message: "Location ID is not valid" } as GenericError
    
    const location: Location = (locationResult as Location[])[0]

    const jobsResult: JobSummary[] | GenericError = await dbGetJobSummariesByLocation(location.locationId)

    if ((jobsResult as GenericError).error)
        return { error: true, message: "Failed to load jobs at this Location" }

    const jobs: DateGroupedJobSummaries[] =  groupJobSummariesByDate(jobsResult as JobSummary[])

    const employees: Employee[] | GenericError = await dbGetEmployees()

    if ((employees as GenericError).error)
        return { error: true, message: "Could not retrieve Employees" }

    return {
        locationOfJobs: location,
        jobsAtLocation: jobs,
        allEmployees: employees as Employee[]
    } as JobViewProps
}

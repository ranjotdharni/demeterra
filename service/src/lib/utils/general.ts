import { DateGroupedJobSummaries, JobSummary, RawJobSummary } from "../types/db"
import { GenericError, GenericSuccess } from "../types/general"

export function newError(message: string): GenericError {
    return { error: true, message: message } as GenericError
}

export function newSuccess(message: string): GenericSuccess {
    return { success: true, message: message } as GenericSuccess
}

export function parseRawJobSummary(raw: RawJobSummary): JobSummary {
    return {
        job: {
            jobId: raw.jobId,
            dateOf: raw.dateOf,
            hoursWorked: raw.hoursWorked,
            rideCost: raw.rideCost,
            wage: raw.wage,
        },
        employee: {
            employeeId: raw.employeeId,
            name: raw.employeeName,
            dateCreated: raw.employeeDateCreated
        },
        location: {
            locationId: raw.locationId,
            name: raw.locationName,
            dateCreated: raw.locationDateCreated
        }
    } as JobSummary
}

export function parseRawJobSummaries(raws: RawJobSummary[]): JobSummary[] {
    return raws.map(raw => {
        return parseRawJobSummary(raw)
    })
}

export function groupJobSummariesByDate(jobSummaries: JobSummary[]): DateGroupedJobSummaries[] {
    const grouped = jobSummaries.reduce((acc, jobSummary) => {
        const dateKey = jobSummary.job.dateOf.toISOString().split('T')[0] // format to 'YYYY-MM-DD'
        if (!acc[dateKey]) {
            acc[dateKey] = []
        }
        acc[dateKey].push(jobSummary)
        return acc
    }, {} as Record<string, JobSummary[]>)

    const arrays: JobSummary[][] =  Object.values(grouped)

    return arrays.map(js => {
        return {
            dateOf: js[0].job.dateOf,
            summaries: js
        }
    })
}

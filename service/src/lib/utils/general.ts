import { DateGroupedJobSummaries, Job, JobSummary, RawJobSummary } from "../types/db"
import { GenericError, GenericSuccess } from "../types/general"
import { v4 as uuidv4 } from "uuid"

//=====================================================================================================================================================================================//
//The below function generates a date string in a given format from a given Date object, the format string paramter is case insensitive                                                //
//arg1 can be any string but must include the following 3 substrings IN ANY ORDER ANYWHERE IN THE STRING (CASE INSENSITIVE): ('mm' OR 'mmm') AND ('dd' OR 'ddd') AND ('yy' OR 'yyyy')  //
//=====================================================================================================================================================================================//
//                                                                                                                                                                                     //
//FORMAT EXAMPLES: Using a Date object generated on 10/31/2023 (the date at the time of writing this [ Happy Halloween :) ])                                                           // 
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
//  Use         Format           Output                                                                                                                                                //
// Month    'mm' OR 'MM'     :     10                                                                                                                                                  //
// Month    'mmm' OR 'MMM'   :    Oct                                                                                                                                                  //
//  Day     'dd' OR 'DD'     :     31                                                                                                                                                  //
//  Day     'ddd' OR 'DDD'   :    Tue                                                                                                                                                  //
// Year     'yy' OR 'YY'     :     23                                                                                                                                                  //
// Year     'yyyy' OR 'YYYY' :   2023                                                                                                                                                  //
//                                                                                                                                                                                     //
//USAGE EXAMPLE: Using a Date object generated on 10/31/2023                                                                                                                           //
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------//
// dateToFormat('MMM dd, yYyY', new Date()) -> outputs string 'Oct 31, 2023'            !!!!!!!!!!!!!!!!EXAMPLE ON THIS LINE!!!!!!!!!!!!!!!!                                           // 
//                                                                                                                                                                                     //
// ^the only reason the above function call's input string uses both upper and lowercase characters is to demonstrate that this function is case insensitive!                          //
//=====================================================================================================================================================================================//
export function dateToFormat(arg1: string, arg2: Date): string
{
    let str = arg1.toLowerCase().slice()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    let mm = (str.includes('mmm') ? 'mmm' : 'mm')
    let dd = (str.includes('ddd') ? 'ddd' : 'dd')
    let yy = (str.includes('yyyy') ? 'yyyy' : 'yy')

    str = str.replace(mm, (mm === 'mm' ? (arg2.getMonth() + 1).toString().padStart(2, '0') : monthNames[arg2.getMonth()]))
    str = str.replace(dd, (dd === 'dd' ? (arg2.getDate()).toString().padStart(2, '0') : dayNames[arg2.getDay()]))
    str = str.replace(yy, (yy === 'yyyy' ? (arg2.getFullYear()).toString() : arg2.getFullYear().toString().slice(-2)))

    return str
}

export function parseLocalDateFromInputValue(value: string): Date {
    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day)
}

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
            id: uuidv4(),
            dateOf: js[0].job.dateOf,
            summaries: js
        }
    })
}

export function deepCopyDateGroupedJobSummaries(input: DateGroupedJobSummaries): DateGroupedJobSummaries {
    return {
        id: input.id,
        dateOf: new Date(input.dateOf),
        summaries: input.summaries.map(summary => ({
            job: {
                jobId: summary.job.jobId,
                locationId: summary.job.locationId,
                employeeId: summary.job.employeeId,
                dateOf: new Date(summary.job.dateOf),
                hoursWorked: summary.job.hoursWorked,
                rideCost: summary.job.rideCost,
                wage: summary.job.wage,
            },
            employee: {
                employeeId: summary.employee.employeeId,
                name: summary.employee.name,
                dateCreated: new Date(summary.employee.dateCreated),
            },
            location: {
                locationId: summary.location.locationId,
                name: summary.location.name,
                dateCreated: new Date(summary.location.dateCreated),
            }
        } as JobSummary
    ))}
}

export function deepCopyDateGroupedJobSummariesArray(input: DateGroupedJobSummaries[]): DateGroupedJobSummaries[] {
    return input.map(item => {
        return deepCopyDateGroupedJobSummaries(item)
    })
}

export function flattenDateGroupedJobSummariesToJobSummaries(complex: DateGroupedJobSummaries[]): JobSummary[] {
    let flattened: JobSummary[] = []

    complex.forEach(group => {
        flattened = [...flattened, ...group.summaries]
    })

    return flattened
}

export function convertSummariesToJobs(input: JobSummary[]): Job[] {
    return input.map(summary => {
        return summary.job
    })
}

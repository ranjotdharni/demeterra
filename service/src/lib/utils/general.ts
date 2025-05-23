import { DateGroupedJobSummaries, Job, JobSummary, RawJobSummary } from "../types/db"
import { EmployeeStatistics, GenericError, GenericSuccess, SummaryStatistics } from "../types/general"
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

// This function is generally reserved for client-side use. Be wary 
// of what the logic is doing specifically if used elsewhere!
export function parseLocalDateFromInputValue(value: string): Date {
    const [year, month, day] = value.split('-').map(Number)

    const now = new Date()
    const hours = now.getHours()
    const minutes = now.getMinutes()
    const seconds = now.getSeconds()
    const milliseconds = now.getMilliseconds()

    return new Date(year, month - 1, day, hours, minutes, seconds, milliseconds)
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
            locationId: raw.locationId,
            employeeId: raw.employeeId,
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
    console.log()

    const grouped = jobSummaries.reduce((acc, jobSummary) => {
        const dateKey = jobSummary.job.dateOf.toISOString().slice(0, 19) // format to 'YYYY-MM-DD hh:mm:ss'
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

// a deep copy of the input object (including id)
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

// a new Date Grouped Job Summaries List (has its own id) but with the attributes of the input object
export function duplicateDateGroupedJobSummaries(input: DateGroupedJobSummaries): DateGroupedJobSummaries {
    return {
        id: uuidv4(),
        dateOf: new Date(input.dateOf),
        summaries: input.summaries.map(summary => ({
            job: {
                jobId: uuidv4(),
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

export function hasDuplicateDates(jobs: DateGroupedJobSummaries[]): boolean {
    const seenDates = new Set<string>()

    for (const job of jobs) {
        const date = job.dateOf
        const key = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

        if (seenDates.has(key)) {
            return true // Duplicate found
        }

        seenDates.add(key)
    }

    return false // No duplicates
}

export function arrayToTriplets<T>(arr: T[]): T[][] {
    const result: T[][] = []
    for (let i = 0; i < arr.length; i += 3) {
        result.push(arr.slice(i, i + 3))
    }
    return result
}

export function calculateStatistics(data: DateGroupedJobSummaries[]): SummaryStatistics {
    let dataMap = new Map<string, EmployeeStatistics>()

    for (const group of data) {
        const summaries: JobSummary[] = group.summaries

        // add each employees earnings data or replace if it already exists in map
        for (const summary of summaries) {
            if (dataMap.has(summary.job.employeeId)) {
                const existingStats: EmployeeStatistics = dataMap.get(summary.job.employeeId)!

                // Remember, wage and ride cost can be job specific (based on group)!
                const hours: number = existingStats.hours + Number(summary.job.hoursWorked)
                const earnings: number = existingStats.earnings + (Number(summary.job.hoursWorked) * Number(summary.job.wage))
                const rideCost: number = existingStats.rideCost + Number(summary.job.rideCost)
                const revenue: number = existingStats.revenue + ((Number(summary.job.hoursWorked) * Number(summary.job.wage)) - Number(summary.job.rideCost))

                const newStats: EmployeeStatistics = {
                    employee: summary.employee,
                    hours: hours,
                    earnings: earnings,
                    rideCost: rideCost,
                    revenue: revenue
                }

                dataMap.set(summary.job.employeeId, newStats)
            }
            else {
                const stats: EmployeeStatistics = {
                    employee: summary.employee,
                    hours: Number(summary.job.hoursWorked),
                    earnings: summary.job.hoursWorked * summary.job.wage,
                    rideCost: Number(summary.job.rideCost),
                    revenue: (summary.job.hoursWorked * summary.job.wage) - Number(summary.job.rideCost)
                }

                dataMap.set(summary.job.employeeId, stats)
            }
        }

    }

    const employeeEarnings: EmployeeStatistics[] = Array.from(dataMap.values())

    let totalHours: number = 0
    let totalEarnings: number = 0
    let totalRideCost: number = 0
    let totalRevenue: number = 0

    // add up totals
    employeeEarnings.forEach(employeeStats => {
        totalHours = totalHours + employeeStats.hours
        totalEarnings = totalEarnings + employeeStats.earnings
        totalRideCost = totalRideCost + employeeStats.rideCost
        totalRevenue = totalRevenue + employeeStats.revenue
    })

    return {
        totalHours: totalHours,
        totalEarnings: totalEarnings,
        totalRideCost: totalRideCost,
        totalRevenue: totalRevenue,
        employeeEarnings: employeeEarnings
    }
}

import { RowDataPacket } from "mysql2"

export interface Session extends RowDataPacket {
    username: string
    token: string
    expiresAt: Date
}

export interface Location extends RowDataPacket {
    locationId: string
    name: string
    dateCreated: Date
}

export interface Employee extends RowDataPacket {
    employeeId: string
    name: string
    dateCreated: Date
}

export interface Job extends RowDataPacket {
    jobId: string
    locationId: string
    employeeId: string
    dateOf: Date
    hoursWorked: number    
    rideCost: number       
    wage: number
}

export interface RawJobSummary extends RowDataPacket {
    jobId: string
    dateOf: Date
    hoursWorked: number
    rideCost: number
    wage: number
    employeeId: string
    employeeName: string
    employeeDateCreated: Date
    locationId: string
    locationName: string
    locationDateCreated: Date
}

export interface JobSummary {
    job: Job
    employee: Employee
    location: Location
}

export interface DateGroupedJobSummaries {
    dateOf: Date
    summaries: JobSummary[]
}

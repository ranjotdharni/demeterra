import { Employee } from "./db"

export interface GenericError {
    error: true
    message: string
}

export interface GenericSuccess {
    success: true
    message: string
}

export interface EmployeeStatistics {
    employee: Employee
    hours: number
    earnings: number
    rideCost: number
    revenue: number
}

export interface SummaryStatistics {
    totalHours: number
    totalEarnings: number
    totalRideCost: number
    totalRevenue: number
    employeeEarnings: EmployeeStatistics[]
}

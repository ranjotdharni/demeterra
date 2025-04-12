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

import { RowDataPacket } from "mysql2"

export interface Session extends RowDataPacket {
    username: string
    token: string
    expiresAt: Date
}

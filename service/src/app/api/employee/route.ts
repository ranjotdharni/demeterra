import { dbAddEmployee, dbGetEmployees } from "@/db/actions"
import { NextRequest, NextResponse } from "next/server"
import { GenericError } from "@/lib/types/general"
import { newError } from "@/lib/utils/general"
import { Employee } from "@/lib/types/db"

export async function GET(request: NextRequest) {
    if (request.method !== "GET")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const response: Employee[] | GenericError = await dbGetEmployees()

    if ((response as GenericError).error) 
        return NextResponse.json(newError("INTERNAL SERVER ERROR"), { status: 500 })

    return NextResponse.json(response as Employee[], { status: 200 })
}

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.name === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const response: Employee[] | GenericError = await dbAddEmployee(data.name)

    if ((response as GenericError).error || (response as Employee[]).length === 0) 
        return NextResponse.json(newError("INTERNAL SERVER ERROR"), { status: 500 })

    return NextResponse.json((response as Employee[])[0], { status: 200 })
}

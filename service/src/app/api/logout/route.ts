import { dbClearSession } from "@/db/actions"
import { GenericError, GenericSuccess } from "@/lib/types/general"
import { newSuccess } from "@/lib/utils/general"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.username === undefined || data.token === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const result: GenericSuccess | GenericError = await dbClearSession(data.username, data.token)

    if ((result as GenericError).error) {
        return NextResponse.json(result as GenericError, { status: 400 })
    }

    return NextResponse.json(newSuccess("User was logged out"), { status: 200 })
}

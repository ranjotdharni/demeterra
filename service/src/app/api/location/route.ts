import { dbAddLocation, dbGetLocations } from "@/db/actions"
import { NextRequest, NextResponse } from "next/server"
import { GenericError } from "@/lib/types/general"
import { newError } from "@/lib/utils/general"
import { Location } from "@/lib/types/db"

export async function GET(request: NextRequest) {
    if (request.method !== "GET")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const response: Location[] | GenericError = await dbGetLocations()

    if ((response as GenericError).error) 
        return NextResponse.json(newError("INTERNAL SERVER ERROR"), { status: 500 })

    return NextResponse.json(response as Location[], { status: 200 })
}

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.name === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const response: Location[] | GenericError = await dbAddLocation(data.name)

    if ((response as GenericError).error || (response as Location[]).length === 0) 
        return NextResponse.json(newError("INTERNAL SERVER ERROR"), { status: 500 })

    return NextResponse.json((response as Location[])[0], { status: 200 })
}

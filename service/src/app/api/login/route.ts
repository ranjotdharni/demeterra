import { dbCreateSession, dbGetSession } from "@/db/actions"
import { NextRequest, NextResponse } from "next/server"
import { GenericError } from "@/lib/types/general"
import { newError } from "@/lib/utils/general"
import { Session } from "@/lib/types/db"
import { cookies } from "next/headers"
import { compare } from "bcrypt"

// get a new token
export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.username === undefined || data.key === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const authorized: boolean = await compare(data.key, process.env.SERVICE_KEY!)

    if (!authorized) {
        return NextResponse.json({ error: true, message: "UNAUTHORIZED" } as GenericError, { status: 401 })
    }

    const result = await dbCreateSession(data.username)

    if ((result as GenericError).error) {
        return NextResponse.json(result as GenericError, { status: 400 })
    }

    if ((result as Session[]).length === 0) {
        return NextResponse.json(newError("Database Did Not Return a Session"), { status: 500 })
    }

    const cookieStore = await cookies()
    const username: string = (result as Session[])[0].username
    const token: string = (result as Session[])[0].token
    const expiresAt: Date = (result as Session[])[0].expiresAt

    cookieStore.set("username", username, { expires: expiresAt })
    cookieStore.set("token", token, { expires: expiresAt })

    return NextResponse.json({ success: true }, { status: 200 })
}

// check if token is valid
export async function PUT(request: NextRequest) {
    if (request.method !== "PUT")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.username === undefined || data.token === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const result = await dbGetSession(data.username, data.token)

    if ((result as GenericError).error) {
        return NextResponse.json(result as GenericError, { status: 400 })
    }

    if ((result as Session[]).length === 0) {
        return NextResponse.json(newError("Database Did Not Return a Session"), { status: 500 })
    }

    const compare = (result as Session[])[0].expiresAt

    if (new Date() > compare)
        return NextResponse.json(newError("Session has Expired"), { status: 498 })

    return NextResponse.json({ success: true }, { status: 200 })
}

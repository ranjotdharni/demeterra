import { dbCreateNote, dbDeleteNote, dbEditNote } from "@/db/actions"
import { GenericError, GenericSuccess } from "@/lib/types/general"
import { NextRequest, NextResponse } from "next/server"
import { newError } from "@/lib/utils/general"
import { Note } from "@/lib/types/db"

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (!data.content)
        return NextResponse.json(newError("MALFORMED REQUEST"), { status: 400 })

    const response: Note | GenericError = await dbCreateNote(data.content, new Date())

    if ((response as GenericError).error) 
        return NextResponse.json(response as GenericError, { status: 500 })

    return NextResponse.json(response as Note, { status: 200 })
}

export async function PUT(request: NextRequest) {
    if (request.method !== "PUT")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (!data.id || !data.content)
        return NextResponse.json(newError("MALFORMED REQUEST"), { status: 400 })

    const response: GenericSuccess | GenericError = await dbEditNote(data.id, data.content)

    if ((response as GenericError).error) 
        return NextResponse.json(response as GenericError, { status: 500 })

    return NextResponse.json(response as GenericSuccess, { status: 200 })
}

export async function DELETE(request: NextRequest) {
    if (request.method !== "DELETE")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (!data.id)
        return NextResponse.json(newError("MALFORMED REQUEST"), { status: 400 })

    const response: GenericSuccess | GenericError = await dbDeleteNote(data.id)

    if ((response as GenericError).error) 
        return NextResponse.json(response as GenericError, { status: 500 })

    return NextResponse.json(response as GenericSuccess, { status: 200 })
}

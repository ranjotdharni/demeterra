import { JobViewProps } from "@/app/components/job/JobView"
import { dbAddModifyRemoveJobs } from "@/db/actions"
import { GenericError, GenericSuccess } from "@/lib/types/general"
import { fetchJobViewProps } from "@/lib/utils/db"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    if (data.locationId === undefined || data.adding === undefined || data.modifying === undefined || data.removing === undefined)
        return NextResponse.json({ error: true, message: "MALFORMED REQUEST" } as GenericError, { status: 400 })

    const result: GenericSuccess | GenericError = await dbAddModifyRemoveJobs(data.adding, data.modifying, data.removing)

    if ((result as GenericError).error) 
        return NextResponse.json(result as GenericError, { status: 500 })

    const response: JobViewProps | GenericError = await fetchJobViewProps(data.locationId)

    if ((response as GenericError).error) 
        return NextResponse.json(response as GenericError, { status: 500 })

    return NextResponse.json(response as JobViewProps, { status: 200 })
}

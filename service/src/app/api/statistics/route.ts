import { StatisticsViewProps } from "@/app/components/statistics/StatisticsView"
import { fetchStatisticsViewProps } from "@/lib/utils/db"
import { NextRequest, NextResponse } from "next/server"
import { GenericError } from "@/lib/types/general"

export async function POST(request: NextRequest) {
    if (request.method !== "POST")
        return NextResponse.json({ error: true, message: "METHOD NOT ALLOWED" } as GenericError, { status: 405 })

    const data = await request.json()

    const response: StatisticsViewProps | GenericError = await fetchStatisticsViewProps(data.locations, new Date(data.from), new Date(data.to))

    if ((response as GenericError).error) 
        return NextResponse.json(response as GenericError, { status: 500 })

    return NextResponse.json(response as StatisticsViewProps, { status: 200 })
}

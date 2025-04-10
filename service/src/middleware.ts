import { PAGE_LOGIN, PUBLIC_ROUTES } from "./lib/constants/routes"
import { NextResponse, NextRequest } from "next/server"

export default async function middleware(request: NextRequest) {
    const pathname: string = request.nextUrl.pathname

    if (PUBLIC_ROUTES.includes(pathname))
        return NextResponse.next()

    return NextResponse.redirect(`${request.nextUrl.origin}${PAGE_LOGIN}`)
}
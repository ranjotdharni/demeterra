import { API_LOGIN, PAGE_HOME, PAGE_LOGIN, PUBLIC_ROUTES } from "./lib/constants/routes"
import { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { NextResponse, NextRequest } from "next/server"
import { GenericError } from "./lib/types/general"

/*                                          CAUTION                                          */
/* Always check if you are already on the resource being redirected to BEFORE redirecting!!! */
/*       This warning is reiterated using an example in the below middleware comments.       */

export async function middleware(request: NextRequest) {
    const pathname: string = request.nextUrl.pathname

    if (pathname.startsWith("/_next") || pathname.endsWith("/favicon.ico"))
        return NextResponse.next()

    for (let route of PUBLIC_ROUTES) {
        if (pathname === route) {
            return NextResponse.next()
        }
    }

    const username: RequestCookie | undefined = request.cookies.get("username")
    const token: RequestCookie | undefined = request.cookies.get("token")

    // below if-statement says if any required cookies are undefined, then check if already on login page, if not then 
    // redirect to it. DO NOT add an 'and' statement in the if-condition itself below, THAT WOULD BE A BUG since if 
    // you weren't on the login page, middleware could technically continue with undefined cookies. FOLLOW THIS LOGIC 
    // FOR ALL REDIRECTS IN MIDDLEWARE!
    if (username === undefined || token === undefined)
        return (pathname !== PAGE_LOGIN ? NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${PAGE_LOGIN}`) : NextResponse.next())

    const sessionValidated = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_LOGIN}`, {
        method: "PUT",
        body: JSON.stringify({
            username: username.value,
            token: token.value
        })
    }).then(middle => {
        return middle.json()
    })

    // user's session was invalid, redirect to login page, ensuring that user isn't already on the login page
    if ((sessionValidated as GenericError).error)
        return (pathname !== PAGE_LOGIN ? NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${PAGE_LOGIN}`) : NextResponse.next())

    // already has a valid session at this point, redirect to home page if on login page, ensuring that user isn't already on home page
    if (pathname === PAGE_LOGIN)
        return (pathname !== PAGE_HOME ? NextResponse.redirect(`${process.env.NEXT_PUBLIC_ORIGIN}${PAGE_HOME}`) : NextResponse.next())
    else
        return NextResponse.next()
}

"use client"

import { usePathname, useRouter } from "next/navigation"
import { AlignJustify, LogOut, X } from "lucide-react"
import { API_LOGOUT, PAGE_EMPLOYEE, PAGE_HOME, PAGE_LOCATION, PAGE_LOGIN, PAGE_NOTE, PAGE_STATISTICS, PUBLIC_ROUTES } from "@/lib/constants/routes"
import { MouseEvent, useState } from "react"
import { LOGO } from "@/lib/constants/client"
import Cookies from "js-cookie"
import { GenericError, GenericSuccess } from "@/lib/types/general"
import Loader from "./Loader"

interface RouteProps {
    name: string
    href: string
}

const EXEMPT__ROUTES: string[] = [...PUBLIC_ROUTES, PAGE_LOGIN]

const routes: RouteProps[] = [
    {
        name: "Home",
        href: PAGE_HOME
    },
    {
        name: "Locations",
        href: PAGE_LOCATION
    },
    {
        name: "Employees",
        href: PAGE_EMPLOYEE
    },
    {
        name: "Statistics",
        href: PAGE_STATISTICS
    },
    {
        name: "Notes",
        href: PAGE_NOTE
    }
]

function RouteItem({ name, href } : RouteProps) {

    return (
        <li className="w-full h-10 hover:cursor-pointer hover:bg-background-light hover:text-green">
            <a href={ href } className="w-full h-full flex flex-row justify-center items-center">
                { name }
            </a>
        </li>
    )
}

export default function Navbar() {
    const router = useRouter()
    const pathname = usePathname()
    
    const [dynamicTailWind, setDynamicTailwind] = useState<string>("-left-80")
    const [loader, setLoader] = useState<boolean>(false)

    function onOpen(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setDynamicTailwind("-left-0")
    }

    function onClose(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setDynamicTailwind("-left-80")
    }

    async function logOut() {
        const username: string | undefined = Cookies.get("username")
        const token: string | undefined = Cookies.get("token")

        setLoader(true)

        try {
            // if cookies don't exist on client, server won't authenticate you; server's default behavior also handles this case
            if (username === undefined || token === undefined) {
                setLoader(false)
                setDynamicTailwind("-left-80")
                router.push(PAGE_LOGIN)
                return
            }

            // if auth cookies exist, hit the log out endpoint
            const response: GenericSuccess | GenericError = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_LOGOUT}`, {
                method: "POST",
                body: JSON.stringify({
                    username: username,
                    token: token
                })}).then(middle => {
                    return middle.json()
                }).then(response => {
                    return response
                }
            )

            // Error check the log out request
            if ((response as GenericError).error) {
                console.log(response.message)
                return
            }

            if ((response as GenericSuccess).success) {
                console.log(response.message)
                // remember to remove old auth cookies (although the server will handle the case of stale cookies, this is best practice)
                Cookies.remove("username", { path: "/" })
                Cookies.remove("token", { path: "/" })
                setLoader(false)
                setDynamicTailwind("-left-80")
                router.push(PAGE_LOGIN)
            }
        }
        catch (error) {
            console.log(error)
        }

        setLoader(false)
    }

    return (
        !EXEMPT__ROUTES.includes(pathname) &&
        <nav className="h-full fixed z-10">
            <button onClick={onOpen} className="hover:text-green hover:cursor-pointer fixed top-0 left-0">
                <AlignJustify />
            </button>

            <section className={`p-2 w-80 h-full flex flex-col justify-between fixed top-0 bg-background-light backdrop-blur ${dynamicTailWind}`}>
                <div className="w-full h-full">
                    <header className="w-full h-[5%] flex flex-row justify-between items-center border-b border-light-grey">
                        <img src={LOGO} className="h-full aspect-square p-1" />
                        <button onClick={onClose} className="hover:text-red-800 hover:cursor-pointer">
                            <X />
                        </button>
                    </header>

                    <ul className="flex flex-col items-center space-y-2 p-2">
                        {
                            routes.map((route, index) => {
                                return <RouteItem key={`NAVBAR_ROUTE_ITEM_${index}`} name={route.name} href={route.href} />
                            })
                        }
                    </ul>
                </div>

                <div className="w-full h-[5%] flex flex-row justify-end items-center">
                    <button disabled={loader} onClick={logOut} className="hover:text-red-800 hover:cursor-pointer flex flex-row space-x-2">
                        {
                            loader ? 
                            <Loader tailwindWidth="w-6" /> :
                            <></>
                        }
                        <p>Log Out</p>
                        <LogOut />
                    </button>
                </div>
            </section>
        </nav> 
    )
}

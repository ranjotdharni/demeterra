"use client"

import { API_LOGIN, PAGE_HOME } from "@/lib/constants/routes"
import { ChangeEvent, FormEvent, useState } from "react"
import { useRouter } from "next/navigation"

export default function Page() {
    const router = useRouter()

    const [username, setUsername] = useState<string>("")
    const [serviceKey, setServiceKey] = useState<string>("")
    const [error, setError] = useState<string>("")

    function editUsername(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setUsername(event.target.value)
    }

    function editServiceKey(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()
        setServiceKey(event.target.value)
    }

    async function onSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()
        event.stopPropagation()
        
        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_LOGIN}`, {
            method: "POST",
            body: JSON.stringify({
                username: username,
                key: serviceKey
            })
        }).then(middle => {
            return middle.json()
        }).then(result => {
            console.log(result)
            if (result.error) {
                setError(result.message)
                return
            }

            if (result.success) {
                router.push(PAGE_HOME)
                return
            }
        })
    }

    return (
        <section className="p-8 w-screen h-screen flex flex-col justify-center items-center">
            <form onSubmit={onSubmit} className="w-auto h-auto p-8 border border-light-grey shadow-xl flex flex-col justify-start items-end space-y-8">
                <input value={username} onChange={editUsername} placeholder="Enter Username" className="w-auto bg-gray-400 text-black" />
                <input type="password" value={serviceKey} onChange={editServiceKey} placeholder="Enter Service Key" className="w-auto bg-gray-400 text-black" />
                <button type="submit" className="hover:cursor-pointer py-2 px-4 text-foreground border border-light-grey rounded-lg">Login</button>
                <p className="text-red-700">{error}</p>
            </form>
        </section>
    )
}

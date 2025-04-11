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
        <section className="p-8">
            <form onSubmit={onSubmit} className="w-auto h-auto flex flex-col justify-start items-start space-y-4">
                <input value={username} onChange={editUsername} placeholder="Enter Username" className="w-auto bg-gray-400 text-black" />
                <input type="password" value={serviceKey} onChange={editServiceKey} placeholder="Enter Service Key" className="w-auto bg-gray-400 text-black" />
                <button type="submit" className="bg-gray-400 text-black hover:cursor-pointer p-2">Login</button>
                <p className="text-red-700">{error}</p>
            </form>
        </section>
    )
}

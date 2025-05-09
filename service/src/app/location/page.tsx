"use client"

import { API_LOCATION, PAGE_JOB } from "@/lib/constants/routes"
import { useEffect, useState } from "react"
import { Location } from "@/lib/types/db"
import Loader from "../components/utils/Loader"

export default function Page() {
    const [locations, setLocations] = useState<Location[]>([])
    const [newLocation, setNewLocation] = useState<string>("")
    const [loader, setLoader] = useState<boolean>(false)

    async function getLocations() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_LOCATION}`).then(middle => {
            return middle.json()
        }).then(response => {
            setLocations(response as Location[])
        }).finally(() => {
            setLoader(false)
        })
    }

    async function addLocation() {
        if (newLocation.length < 1 || newLocation.length > 64)
            return

        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_LOCATION}`, {
            method: "POST",
            body: JSON.stringify({
                name: newLocation
            })
        }).then(middle => {
            return middle.json()
        }).then(response => {
            const returnedLocation: Location = response as Location
            setLocations([...locations, returnedLocation])
            setNewLocation("")
        }).finally(() => {
            setLoader(false)
        })
    }

    useEffect(() => {
        getLocations()
    }, [])

    return (
        <section className="p-4">
            <header className="w-auto h-auto py-4 space-x-4 flex flex-row items-center border-b border-light-grey">
                <h1 className="text-5xl text-green">Locations</h1>
                <input value={newLocation} onChange={(e) => {setNewLocation(e.target.value)}} placeholder="Enter name..." className="w-50 p-1 bg-light-grey text-black" />
                <button onClick={() => addLocation()} className="p-1 border border-light-grey rounded hover:cursor-pointer">Add Location</button>
            </header>

            {
                loader ? 
                <div className="w-full h-60 flex flex-col justify-end items-center">
                    <Loader />
                </div> : 
                <ul className="py-2 space-y-4">
                    {
                        locations.map(location => {
                            return (
                                <li key={location.locationId} className="w-auto h-auto px-4 py-2 border border-light-grey rounded-lg flex flex-row items-center space-x-2">
                                    <h2 className="text-2xl">{location.name}</h2>
                                    <a href={`${PAGE_JOB}/${location.locationId}`} className="hover:cursor-pointer py-1 px-4 text-foreground border border-light-grey rounded-lg">View</a>
                                </li>
                            )
                        })
                    }
                </ul>
            }
        </section>
    )
}

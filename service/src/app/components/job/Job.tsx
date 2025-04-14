"use client"

import { JobSummary } from "@/lib/types/db"
import { Trash } from "lucide-react"
import { useState } from "react"

interface JobProps {
    job: JobSummary
}

export default function JobProps({ job } : JobProps) {
    const [hours, setHours] = useState<string>("1")

    return (
        <li className="p-2 border-l border-r w-auto flex flex-row space-x-2">
            <p className="text-md text-green">{job.employee.name}</p>
            <input type="number" value={hours} onChange={e => { setHours(e.target.value) }} className="bg-light-grey w-15" />
            <button className="hover:text-red-800 hover:cursor-pointer">
                <Trash />
            </button>
        </li>
    )
}

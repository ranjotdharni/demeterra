"use client"

import { ChangeEvent, MouseEvent } from "react"
import { JobSummary } from "@/lib/types/db"
import { Trash } from "lucide-react"

interface JobProps {
    job: JobSummary
    editJob: (edit: JobSummary) => void
    removeJob: (remove: JobSummary) => void
}

export default function JobProps({ job, editJob, removeJob } : JobProps) {
    function onChange(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        if (isNaN(+event.target.value))
            return

        const editedJob: JobSummary = {
            ...job
        }
        editedJob.job.hoursWorked = +event.target.value
        editJob(editedJob)
    }

    function onClick(event: MouseEvent) {
        event.preventDefault()
        removeJob(job)
    }

    return (
        <li className="p-2 border-l border-r min-w-60 w-auto flex flex-row space-x-2">
            <p className="text-md text-green">{job.employee.name}</p>
            <input type="number" value={`${job.job.hoursWorked}`} onChange={onChange} className="bg-light-grey w-15" />
            <button onClick={onClick} className="hover:text-red-800 hover:cursor-pointer">
                <Trash />
            </button>
        </li>
    )
}

"use client"

import { DateGroupedJobSummaries, Employee, JobSummary, Location } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import JobGroup from "./JobGroup"
import { useState } from "react"

interface JobViewProps {
    locationOfJobs: Location
    jobsAtLocation: DateGroupedJobSummaries[]
    allEmployees: Employee[]
}

export default function JobView({ locationOfJobs, jobsAtLocation, allEmployees } : JobViewProps){
    const [location, setLocation] = useState<Location>(locationOfJobs)
    const [jobGroups, setJobGroups] = useState<DateGroupedJobSummaries[]>(jobsAtLocation)
    const [employees, setEmployees] = useState<Employee[]>(allEmployees)
    const [newDate, setNewDate] = useState<string>(new Date().toString())

    const [addedGroups, setAddedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [modifiedGroups, setModifiedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [deletedGroups, setDeletedGroups] = useState<DateGroupedJobSummaries[]>([])

    function addGroup() {
        const dateOf = new Date(newDate)
        const updatedAddedGroups: DateGroupedJobSummaries[] = [
            ...addedGroups,
            {
                id: uuidv4(),
                dateOf: dateOf,
                summaries: []
            }
        ]
        setAddedGroups(updatedAddedGroups)
    }

    return (
        <section className="p-4">
            <header className="w-full border-b border-light-grey p-1 flex flex-row space-x-2">
                <h1 className="text-4xl text-green">{location.name}</h1>
                <input type="date" value={newDate.toString()} onChange={e => { setNewDate(e.target.value) }} />
                <button onClick={addGroup} className="px-2 bg-light-grey rounded-md">Add Date</button>
            </header>
            <ul className="space-y-2 p-2">
                {
                    jobGroups.map(group => {
                        return <JobGroup key={group.id} group={group.summaries} dateOf={group.dateOf} employees={employees} />
                    })
                }
                {
                    addedGroups.map(group => {
                        return <JobGroup key={group.id} group={group.summaries} dateOf={group.dateOf} employees={employees} />
                    })
                }
            </ul>
        </section>
    )
}

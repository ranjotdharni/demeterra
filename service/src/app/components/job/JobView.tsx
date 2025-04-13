"use client"

import { DateGroupedJobSummaries, Employee, JobSummary, Location } from "@/lib/types/db"
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

    return (
        <section className="p-4">
            <header className="w-full border-b border-light-grey p-1">
                <h1 className="text-4xl">{location.name}</h1>
            </header>
            <ul className="space-y-2 p-2">
                {
                    jobGroups.map(group => {
                        return <JobGroup key={group.dateOf.toString()} group={group.summaries} dateOf={group.dateOf} employees={employees} />
                    })
                }
            </ul>
        </section>
    )
}

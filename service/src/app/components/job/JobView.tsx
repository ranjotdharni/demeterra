"use client"

import { DateGroupedJobSummaries, JobSummary, Location } from "@/lib/types/db"
import JobGroup from "./JobGroup"
import { useState } from "react"

interface JobViewProps {
    locationOfJobs: Location
    jobsAtLocation: DateGroupedJobSummaries[]
}

export default function JobView({ locationOfJobs, jobsAtLocation } : JobViewProps){
    const [location, setLocation] = useState<Location>(locationOfJobs)
    const [jobGroups, setJobGroups] = useState<DateGroupedJobSummaries[]>(jobsAtLocation)

    return (
        <section className="p-4">
            <header className="w-full border-b border-light-grey p-1">
                <h1 className="text-4xl">{location.name}</h1>
            </header>
            <ul>
                {
                    jobGroups.map(group => {
                        return <JobGroup key={group.dateOf.toString()} group={group.summaries} />
                    })
                }
            </ul>
        </section>
    )
}

import { JobSummary } from "@/lib/types/db"
import Job from "./Job"

export interface JobGroupProps {
    group: JobSummary[]
}

export default function JobGroup({ group } : JobGroupProps) {

    return (
        <li>
            <ul>
                {
                    group.map(job => {
                        return <Job key={job.job.jobId} job={job} />
                    })
                }
            </ul>
        </li>
    )
}

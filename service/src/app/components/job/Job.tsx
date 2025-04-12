import { JobSummary } from "@/lib/types/db"

interface JobProps {
    job: JobSummary
}

export default function JobProps({ job } : JobProps) {

    return (
        <li>
            <h3>{job.employee.name}</h3>
        </li>
    )
}

import { JobSummary } from "@/lib/types/db"

interface JobProps {
    job: JobSummary
}

export default function JobProps({ job } : JobProps) {

    return (
        <li>
            <p className="text-xl">{job.employee.name}</p>
        </li>
    )
}

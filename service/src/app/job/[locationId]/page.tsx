import JobView, { JobViewProps } from "@/app/components/job/JobView"
import { GenericError } from "@/lib/types/general"
import NotFound from "@/app/404"
import { fetchJobViewProps } from "@/lib/utils/db"

interface JobPageProps {
    params: Promise<{ locationId: string }>
}

export default async function Page({ params } : JobPageProps) {
    const { locationId } = await params

    const result: GenericError | JobViewProps = await fetchJobViewProps(locationId)

    if ((result as GenericError).error)
        return <NotFound message={(result as GenericError).message} />

    return (
        <JobView locationOfJobs={(result as JobViewProps).locationOfJobs} jobsAtLocation={(result as JobViewProps).jobsAtLocation} allEmployees={(result as JobViewProps).allEmployees} />
    )
}

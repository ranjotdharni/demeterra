import { dbGetJobSummariesByLocation, dbGetLocationById } from "@/db/actions"
import { groupJobSummariesByDate } from "@/lib/utils/general"
import { DateGroupedJobSummaries, JobSummary, Location } from "@/lib/types/db"
import JobView from "@/app/components/job/JobView"
import { GenericError } from "@/lib/types/general"
import NotFound from "@/app/404"

interface JobPageProps {
    params: Promise<{ locationId: string }>
}

export default async function Page({ params } : JobPageProps) {
    const { locationId } = await params

    const locationResult: Location[] | GenericError = await dbGetLocationById(locationId)

    if ((locationResult as GenericError).error || (locationResult as Location[]).length === 0)
        return <NotFound message="Location ID is not valid" />
    
    const location: Location = (locationResult as Location[])[0]

    const jobsResult: JobSummary[] | GenericError = await dbGetJobSummariesByLocation(location.locationId)

    if ((jobsResult as GenericError).error)
        return <NotFound message="Failed to load jobs at this Location" />

    const jobs: DateGroupedJobSummaries[] =  groupJobSummariesByDate(jobsResult as JobSummary[])

    return (
        <JobView locationOfJobs={location} jobsAtLocation={jobs} />
    )
}

import JobView, { JobViewProps } from "@/app/components/job/JobView"
import { GenericError } from "@/lib/types/general"
import NotFound from "@/app/404"
import { fetchJobViewProps, fetchStatisticsViewProps } from "@/lib/utils/db"
import StatisticsView, { StatisticsViewProps } from "../components/statistics/StatisticsView"

export default async function Page() {
    const result: GenericError | StatisticsViewProps = await fetchStatisticsViewProps()

    if ((result as GenericError).error)
        return <NotFound message={(result as GenericError).message} />

    return (
        <StatisticsView jobsByLocation={(result as StatisticsViewProps).jobsByLocation} allEmployees={(result as StatisticsViewProps).allEmployees} />
    )
}

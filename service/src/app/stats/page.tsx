import { GenericError } from "@/lib/types/general"
import NotFound from "@/app/404"
import { fetchStatisticsViewProps } from "@/lib/utils/db"
import StatisticsView, { StatisticsViewProps } from "../components/statistics/StatisticsView"
import { Suspense } from "react"

export default async function Page() {
    const result: GenericError | StatisticsViewProps = await fetchStatisticsViewProps()

    if ((result as GenericError).error)
        return <NotFound message={(result as GenericError).message} />

    return (
        <Suspense>
            <StatisticsView locationsOfJobs={(result as StatisticsViewProps).locationsOfJobs} jobs={(result as StatisticsViewProps).jobs} allEmployees={(result as StatisticsViewProps).allEmployees} />
        </Suspense>
    )
}

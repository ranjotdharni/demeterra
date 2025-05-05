"use client"

import { DateGroupedJobSummaries, Employee, JobSummary, Location } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import StatisticsGroup from "./StatisticsGroup"
import { ChangeEvent, MouseEvent, useState } from "react"
import { arrayToTriplets, calculateStatistics, dateToFormat, deepCopyDateGroupedJobSummariesArray, duplicateDateGroupedJobSummaries, parseLocalDateFromInputValue } from "@/lib/utils/general"
import { EmployeeStatistics, SummaryStatistics } from "@/lib/types/general"
import Loader from "../utils/Loader"
import { DEFAULT_RIDE_COST, DEFAULT_WAGE } from "@/lib/constants/client"
import { X } from "lucide-react"

export interface StatisticsViewProps {
    locationsOfJobs: Location[]
    jobs: DateGroupedJobSummaries[]
    allEmployees: Employee[]
}

function EmployeeStatisticsRow({ data } : { data: EmployeeStatistics[] }) {
    return (
        <li>
            <ul className="flex flex-row space-x-8">
                {
                    data.map((stat, index) => {
                        return (
                            <li key={`EMPLOYEE_STATISTIC_ITEM_${index}`}>
                                <p className="border-b border-light-grey text-green">{`${stat.employee.name}`}</p>
                                <div className="flex flex-row space-x-2 p-1">
                                    <p className="border border-light-grey p-1 rounded">{`Hours: ${stat.hours}`}</p>
                                    <p className="border border-light-grey p-1 rounded">{`Earnings: ${stat.earnings}`}</p>
                                    <p className="border border-light-grey p-1 rounded">{`Ride Cost: ${stat.rideCost}`}</p>
                                    <p className="border border-light-grey p-1 rounded">{`Revenue: ${stat.revenue}`}</p>
                                </div>
                            </li>
                        )
                    })
                }
            </ul>
        </li>
    )
}

export default function StatisticsView({ locationsOfJobs, jobs, allEmployees } : StatisticsViewProps) {
    const [locations, setLocations] = useState<string[]>([])
    const [filteredLocations, setFilteredLocations] = useState<string[]>(locationsOfJobs.map(l => l.locationId))
    const [currentSelection, setCurrentSelection] = useState<string | undefined>(filteredLocations.length === 0 ? undefined : filteredLocations[0])
    const [from, setFrom] = useState<Date>()
    const [to, setTo] = useState<Date>()
    const [jobGroupsHardCopy, setJobGroupsHardCopy] = useState<DateGroupedJobSummaries[]>(deepCopyDateGroupedJobSummariesArray(jobs))
    const [jobGroups, setJobGroups] = useState<DateGroupedJobSummaries[]>(deepCopyDateGroupedJobSummariesArray(jobs))
    const [employees, setEmployees] = useState<Employee[]>(allEmployees)
    const [loader, setLoader] = useState<boolean>(false)

    const [addedGroups, setAddedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [modifiedGroups, setModifiedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [deletedGroups, setDeletedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [deletedSummaries, setDeletedSummaries] = useState<JobSummary[]>([])

    const statistics: SummaryStatistics = calculateStatistics([...jobGroups, ...addedGroups, ...modifiedGroups])

    function editCurrentSelection(event: ChangeEvent<HTMLSelectElement>) {
        event.preventDefault()
        setCurrentSelection(event.target.value)
    }

    function addCurrentSelection(event: MouseEvent<HTMLButtonElement>) {
        if (!currentSelection)
            return

        event.preventDefault()
        setLocations([...locations, currentSelection])
        const newFilteredLocations = filteredLocations.filter(loc => loc !== currentSelection)
        setFilteredLocations(newFilteredLocations)
        setCurrentSelection(newFilteredLocations.length === 0 ? undefined : newFilteredLocations[0])
    }

    function generateRemoveLocationMethod(removeLocationId: string): (event: MouseEvent<HTMLButtonElement>) => void {
        return (event: MouseEvent<HTMLButtonElement>) => {
            event.preventDefault()

            const newLocations = [...locations]
            const removeIndex: number = newLocations.indexOf(removeLocationId)

            if (removeIndex === -1)
                return

            const newFilteredLocations: string[] = [...filteredLocations, newLocations[removeIndex]]

            if (currentSelection === undefined)
                setCurrentSelection(newLocations[removeIndex])

            newLocations.splice(removeIndex, 1)
            setLocations(newLocations)
            setFilteredLocations(newFilteredLocations)
        }
    }

    function addGroup() {
        const updatedAddedGroups: DateGroupedJobSummaries[] = [
            ...addedGroups,
            {
                id: uuidv4(),
                dateOf: new Date(),
                summaries: []
            }
        ]
        setAddedGroups(updatedAddedGroups)
    }

    function editDate(id: string): (newDate: Date) => void {
        return (newDate: Date) => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = jobGroups[existingGroupIndex]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]
                const updatedExistingGroup: DateGroupedJobSummaries[] = [...jobGroups]

                updatedExistingGroup.splice(existingGroupIndex, 1)
                
                updatedSummaries.dateOf = newDate
                updatedSummaries.summaries = updatedSummaries.summaries.map(s => { return {...s, job: { ...s.job, dateOf: newDate }} })
                updatedModifiedGroup.push(updatedSummaries)
                
                setJobGroups(updatedExistingGroup)
                setModifiedGroups(updatedModifiedGroup)
            }
            else if (addedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = addedGroups[addedGroupIndex]
                const updatedAddedGroup: DateGroupedJobSummaries[] = [...addedGroups]

                updatedSummaries.dateOf = newDate
                updatedSummaries.summaries = updatedSummaries.summaries.map(s => { return {...s, job: { ...s.job, dateOf: newDate }} })
                updatedAddedGroup[addedGroupIndex] = updatedSummaries

                setAddedGroups(updatedAddedGroup)
            }
            else if (modifiedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = modifiedGroups[modifiedGroupIndex]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]

                updatedSummaries.dateOf = newDate
                updatedSummaries.summaries = updatedSummaries.summaries.map(s => { return {...s, job: { ...s.job, dateOf: newDate }} })
                updatedModifiedGroup[modifiedGroupIndex] = updatedSummaries

                setModifiedGroups(updatedModifiedGroup)
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function modifyAddJob(id: string): (addedJob: JobSummary) => void {
        return (addedJob: JobSummary) => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = jobGroups[existingGroupIndex] // get the to-be updated job group
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]
                const updatedExistingGroup: DateGroupedJobSummaries[] = [...jobGroups]

                updatedExistingGroup.splice(existingGroupIndex, 1)  // splice out the job group that's about to be modified from existing groups
                
                updatedSummaries.summaries.push(addedJob)   // add new summary into the to-be updated job group
                updatedModifiedGroup.push(updatedSummaries) // add the updated summaries into the modified jobs groups
                
                // propogate changes to existing and modified job groups
                setJobGroups(updatedExistingGroup)
                setModifiedGroups(updatedModifiedGroup)
            }
            else if (addedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = addedGroups[addedGroupIndex]
                const updatedAddedGroup: DateGroupedJobSummaries[] = [...addedGroups]

                updatedSummaries.summaries.push(addedJob)
                updatedAddedGroup[addedGroupIndex] = updatedSummaries

                setAddedGroups(updatedAddedGroup)
            }
            else if (modifiedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = modifiedGroups[modifiedGroupIndex]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]

                updatedSummaries.summaries.push(addedJob)
                updatedModifiedGroup[modifiedGroupIndex] = updatedSummaries

                setModifiedGroups(updatedModifiedGroup)
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function modifyEditJob(id: string): (editedJob: JobSummary) => void {
        return (editedJob: JobSummary) => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = jobGroups[existingGroupIndex] // get the to-be updated job group
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]
                const updatedExistingGroup: DateGroupedJobSummaries[] = [...jobGroups]

                updatedExistingGroup.splice(existingGroupIndex, 1)  // splice out the job group that's about to be modified from existing groups
                
                const updatedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === editedJob.job.jobId)
                if (updatedSummaryIndex === -1) {
                    console.log("Could not find to-be updated Job in Existing Job Group")
                    return
                }

                updatedSummaries.summaries[updatedSummaryIndex] = editedJob   // add updated summary into the to-be updated job group, replacing its old summary
                updatedModifiedGroup.push(updatedSummaries) // add the updated summaries into the modified jobs groups
                
                // propogate changes to existing and modified job groups
                setJobGroups(updatedExistingGroup)
                setModifiedGroups(updatedModifiedGroup)
            }
            else if (addedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = addedGroups[addedGroupIndex]
                const updatedAddedGroup: DateGroupedJobSummaries[] = [...addedGroups]

                const updatedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === editedJob.job.jobId)
                if (updatedSummaryIndex === -1) {
                    console.log("Could not find to-be updated Job in Added Job Group")
                    return
                }

                updatedSummaries.summaries[updatedSummaryIndex] = editedJob
                updatedAddedGroup[addedGroupIndex] = updatedSummaries
                // updatedAddedGroup[updatedAddedGroup.findIndex(g => g.id === updatedSummaries.id)] = updatedSummaries

                setAddedGroups(updatedAddedGroup)
            }
            else if (modifiedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = modifiedGroups[modifiedGroupIndex]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]

                const updatedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === editedJob.job.jobId)
                if (updatedSummaryIndex === -1) {
                    console.log("Could not find to-be updated Job in Modified Job Group")
                    return
                }

                updatedSummaries.summaries[updatedSummaryIndex] = editedJob
                updatedModifiedGroup[modifiedGroupIndex] = updatedSummaries
                // updatedModifiedGroup[updatedModifiedGroup.findIndex(g => g.id === updatedSummaries.id)] = updatedSummaries

                setModifiedGroups(updatedModifiedGroup)
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function modifyRemoveJob(id: string): (removedJob: JobSummary) => void {
        return (removedJob: JobSummary) => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = jobGroups[existingGroupIndex] // get the to-be updated job group
                const updatedModifiedGroup: DateGroupedJobSummaries[] = deepCopyDateGroupedJobSummariesArray(modifiedGroups)
                const updatedExistingGroup: DateGroupedJobSummaries[] = deepCopyDateGroupedJobSummariesArray(jobGroups)

                updatedExistingGroup.splice(existingGroupIndex, 1)  // splice out the job group that's about to be modified from existing groups
                
                const removedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === removedJob.job.jobId)
                if (removedSummaryIndex === -1) {
                    console.log("Could not find to-be removed Job in Existing Job Group")
                    return
                }

                updatedSummaries.summaries.splice(removedSummaryIndex, 1)   // splice out removed summary from the to-be updated job group
                updatedModifiedGroup.push(updatedSummaries) // add the updated summaries into the modified jobs groups
                
                const deletedSummariesUpdate: JobSummary[] = [...deletedSummaries, removedJob]
                setDeletedSummaries(deletedSummariesUpdate)

                // propogate changes to existing and modified job groups
                setJobGroups(updatedExistingGroup)
                setModifiedGroups(updatedModifiedGroup)
            }
            else if (addedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = addedGroups[addedGroupIndex]
                const updatedAddedGroup: DateGroupedJobSummaries[] = [...addedGroups]

                const removedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === removedJob.job.jobId)
                if (removedSummaryIndex === -1) {
                    console.log("Could not find to-be removed Job in Added Job Group")
                    return
                }

                updatedSummaries.summaries.splice(removedSummaryIndex, 1)
                updatedAddedGroup[addedGroupIndex] = updatedSummaries

                setAddedGroups(updatedAddedGroup)
            }
            else if (modifiedGroupIndex !== -1) {
                const updatedSummaries: DateGroupedJobSummaries = modifiedGroups[modifiedGroupIndex]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]

                const removedSummaryIndex: number = updatedSummaries.summaries.findIndex(s => s.job.jobId === removedJob.job.jobId)
                if (removedSummaryIndex === -1) {
                    console.log("Could not find to-be removed Job in Modified Job Group")
                    return
                }

                updatedSummaries.summaries.splice(removedSummaryIndex, 1)
                updatedModifiedGroup[modifiedGroupIndex] = updatedSummaries

                const deletedSummariesUpdate: JobSummary[] = [...deletedSummaries, removedJob]
                setDeletedSummaries(deletedSummariesUpdate)

                setModifiedGroups(updatedModifiedGroup)
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function deleteGroup(id: string): () => void {
        return () => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const removingGroup: DateGroupedJobSummaries = jobGroups[existingGroupIndex] // get the to-be removed job group
                const updatedDeletedGroup: DateGroupedJobSummaries[] = [...deletedGroups, removingGroup]    // add to-be removed job group to deleted groups
                const updatedExistingGroup: DateGroupedJobSummaries[] = [...jobGroups]

                updatedExistingGroup.splice(existingGroupIndex, 1)  // splice out the job group that's about to be deleted from existing groups
                
                // propogate changes to existing and deleted job groups
                setJobGroups(updatedExistingGroup)
                setDeletedGroups(updatedDeletedGroup)
            }
            else if (addedGroupIndex !== -1) {
                const updatedAddedGroup: DateGroupedJobSummaries[] = [...addedGroups]
                updatedAddedGroup.splice(addedGroupIndex, 1)
                setAddedGroups(updatedAddedGroup)
            }
            else if (modifiedGroupIndex !== -1) {
                const removingGroup: DateGroupedJobSummaries = modifiedGroups[modifiedGroupIndex]
                const updatedDeletedGroup: DateGroupedJobSummaries[] = [...deletedGroups, removingGroup]
                const updatedModifiedGroup: DateGroupedJobSummaries[] = [...modifiedGroups]

                updatedModifiedGroup.splice(modifiedGroupIndex, 1)

                setModifiedGroups(updatedModifiedGroup)
                setDeletedGroups(updatedDeletedGroup)
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function duplicateGroup(id: string) {
        return () => {
            const existingGroupIndex = jobGroups.findIndex(j => j.id === id)
            const addedGroupIndex = addedGroups.findIndex(j => j.id === id)
            const modifiedGroupIndex = modifiedGroups.findIndex(j => j.id === id)

            if (existingGroupIndex !== -1) {
                const copy: DateGroupedJobSummaries = duplicateDateGroupedJobSummaries(jobGroups[existingGroupIndex])
                setAddedGroups([...addedGroups, copy])
            }
            else if (addedGroupIndex !== -1) {
                const copy: DateGroupedJobSummaries = duplicateDateGroupedJobSummaries(addedGroups[addedGroupIndex])
                setAddedGroups([...addedGroups, copy])
            }
            else if (modifiedGroupIndex !== -1) {
                const copy: DateGroupedJobSummaries = duplicateDateGroupedJobSummaries(modifiedGroups[modifiedGroupIndex])
                setAddedGroups([...addedGroups, copy])
            }
            else {
                console.log("Could not find Job Group")
                return
            }
        }
    }

    function undoChanges(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setAddedGroups([])
        setModifiedGroups([])
        setDeletedGroups([])
        setDeletedSummaries([])
        setJobGroups(jobGroupsHardCopy)
    }

    function clearFilters(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setLocations([])
        const resetFilter: string[] = locationsOfJobs.map(l => l.locationId)
        setFilteredLocations(resetFilter)
        setCurrentSelection(resetFilter.length === 0 ? undefined : resetFilter[0])
        setFrom(undefined)
        setTo(undefined)
    }

    async function applyFilters(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()


    }

    // Uncomment this block for testing in the console
    /*
    function debugTest() {
        console.log("--- Test Results ---")
        console.log("Existing: ", jobGroups)
        console.log("Added: ", addedGroups)
        console.log("Modified: ", modifiedGroups)
        console.log("Deleted (G): ", deletedGroups)
        console.log("Deleted (S): ", deletedSummaries)
    }

    useEffect(() => {
        debugTest()
    }, [addedGroups, jobGroups, modifiedGroups, deletedGroups, deletedSummaries])
    */

    return (
        <section className="p-4 w-auto space-y-2 inline-flex flex-col">
            <header className="border-b-2 border-light-grey py-1 px-2 inline-flex flex-row space-x-2" style={{width: "fit-content"}}>
                <h1 className="text-4xl text-green">Statistics</h1>
                <button onClick={addGroup} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Add Group</button>
                <button onClick={undoChanges} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Undo Group Changes</button>
                <button onClick={clearFilters} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Clear Filters</button>
                <button className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Apply Filters</button>
            </header>

            <div className="py-1 px-2 w-auto inline-flex flex-col">
                <div className="w-auto space-x-2 flex flex-row">
                    <h2 className="text-2xl">Select Locations</h2>
                    <select className="outline-none" disabled={filteredLocations.length === 0} value={currentSelection ? currentSelection : ""} onChange={editCurrentSelection}>
                        {
                            filteredLocations.map((location, index) => {
                                return <option key={`ADD_LOCATION_SELECT_${location}`} value={location}>{locationsOfJobs.find(l => l.locationId === location)?.name}</option>
                            })
                        }
                    </select>
                    <button className="px-3 bg-light-grey rounded-md hover:cursor-pointer" onClick={addCurrentSelection}>Add</button>
                </div>
                <ul className="w-auto flex flex-row p-2 space-x-2">
                    {
                        locations.map(locId => {
                            const name: string | undefined = locationsOfJobs.find(l => l.locationId === locId)?.name
                            return (
                                <li key={`ADDED_LOCATION_LIST_${locId}`} className="p-1 space-x-2 border border-light-grey flex flex-row items-center">
                                    <p>{name}</p>
                                    <button className="h-3/4 aspect-square hover:text-red-800 hover:cursor-pointer" onClick={generateRemoveLocationMethod(locId)}>
                                        <X className="w-full h-full" />
                                    </button>
                                </li>
                            )
                        })
                    }
                </ul>
            </div>

            <div className="py-1 px-2 space-x-2 flex flex-row items-center">
                {
                    from ?
                    <>
                        <label>From:</label>
                        <input type="date" value={dateToFormat("YYYY-MM-DD", from ? new Date(from) : new Date())} onChange={e => { setFrom(parseLocalDateFromInputValue(e.target.value)) }} />
                        <button className="h-4 aspect-square hover:text-red-800 hover:cursor-pointer" onClick={() => { setFrom(undefined) }}>
                            <X className="w-full h-full" />
                        </button>
                    </> : 
                    <button onClick={() => { setFrom(new Date()) }} className="px-3 bg-light-grey rounded-md hover:cursor-pointer">Add From</button>
                }

                {
                    to ?
                    <>
                        <label>To:</label>
                        <input type="date" value={dateToFormat("YYYY-MM-DD", to ? new Date(to) : new Date())} onChange={e => { setTo(parseLocalDateFromInputValue(e.target.value)) }} />
                        <button className="h-4 aspect-square hover:text-red-800 hover:cursor-pointer" onClick={() => { setTo(undefined) }}>
                            <X className="w-full h-full" />
                        </button>
                    </> : 
                    <button onClick={() => { setTo(new Date()) }} className="px-3 bg-light-grey rounded-md hover:cursor-pointer">Add To</button>
                }
            </div>

            <div className="p-4 w-auto h-auto inline-flex flex-col space-y-4">
                <h2 className="text-2xl border-2 rounded-md border-light-grey px-1" style={{width: "fit-content"}}>Statistics</h2>
                <div className="flex flex-row space-x-2 text-lg">
                    <p className="border border-light-grey p-1">{`Total Hours: ${statistics.totalHours}`}</p>
                    <p className="border border-light-grey p-1">{`Total Earnings: ${statistics.totalEarnings}`}</p>
                    <p className="border border-light-grey p-1">{`Total Ride Cost: ${statistics.totalRideCost}`}</p>
                    <p className="border border-light-grey p-1">{`Total Revenue: ${statistics.totalRevenue}`}</p>
                </div>

                <ul className="space-y-4">
                    {
                        arrayToTriplets<EmployeeStatistics>(statistics.employeeEarnings).map((row, index) => {
                            return (
                                <EmployeeStatisticsRow key={`EMPLOYEE_STATISTIC_ROW_${index}`} data={row} />
                            )
                        })
                    }
                </ul>
            </div>

            {
                loader ? 
                <div className="h-60 aspect-square flex flex-col justify-center items-end">
                    <Loader />
                </div> : 
                <ul className="space-y-2 p-2 w-auto inline-flex flex-col">
                    {
                        [...jobGroups, ...modifiedGroups, ...addedGroups].sort((a, b) => a.dateOf.getTime() - b.dateOf.getTime()).map(group => {
                            return <StatisticsGroup 
                                key={group.id} 
                                location={group.summaries[0].location}
                                group={group.summaries} 
                                dateOf={group.dateOf} 
                                employees={employees} 
                                wage={group.summaries.length === 0 ? DEFAULT_WAGE : group.summaries[0].job.wage}
                                rideCost={group.summaries.length === 0 ? DEFAULT_RIDE_COST : group.summaries[0].job.rideCost}
                                duplicate={duplicateGroup(group.id)}
                                editDate={editDate(group.id)}
                                addJob={modifyAddJob(group.id)}
                                editJob={modifyEditJob(group.id)}
                                removeJob={modifyRemoveJob(group.id)}
                                removeGroup={deleteGroup(group.id)}
                            />
                        })
                    }
                </ul>
            }
        </section>
    )
}

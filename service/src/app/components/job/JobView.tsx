"use client"

import { DateGroupedJobSummaries, Employee, Job, JobSummary, Location } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import JobGroup from "./JobGroup"
import { MouseEvent, useEffect, useState } from "react"
import { arrayToTriplets, calculateStatistics, convertSummariesToJobs, deepCopyDateGroupedJobSummaries, deepCopyDateGroupedJobSummariesArray, duplicateDateGroupedJobSummaries, flattenDateGroupedJobSummariesToJobSummaries, hasDuplicateDates } from "@/lib/utils/general"
import { EmployeeStatistics, GenericError, GenericSuccess, SummaryStatistics } from "@/lib/types/general"
import { API_EDIT } from "@/lib/constants/routes"
import Loader from "../utils/Loader"

export interface JobViewProps {
    locationOfJobs: Location
    jobsAtLocation: DateGroupedJobSummaries[]
    allEmployees: Employee[]
}

const DEFAULT_WAGE: number = 16.50
const DEFAULT_RIDE_COST: number = 15.00

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

export default function JobView({ locationOfJobs, jobsAtLocation, allEmployees } : JobViewProps) {
    const [location, setLocation] = useState<Location>(locationOfJobs)
    const [jobGroupsHardCopy, setJobGroupsHardCopy] = useState<DateGroupedJobSummaries[]>(deepCopyDateGroupedJobSummariesArray(jobsAtLocation))
    const [jobGroups, setJobGroups] = useState<DateGroupedJobSummaries[]>(deepCopyDateGroupedJobSummariesArray(jobsAtLocation))
    const [employees, setEmployees] = useState<Employee[]>(allEmployees)
    const [loader, setLoader] = useState<boolean>(false)

    const [addedGroups, setAddedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [modifiedGroups, setModifiedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [deletedGroups, setDeletedGroups] = useState<DateGroupedJobSummaries[]>([])
    const [deletedSummaries, setDeletedSummaries] = useState<JobSummary[]>([])

    const statistics: SummaryStatistics = calculateStatistics([...jobGroups, ...addedGroups, ...modifiedGroups])

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
        setJobGroups(deepCopyDateGroupedJobSummariesArray(jobGroupsHardCopy))
    }

    async function onSave(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setLoader(true)

        if (addedGroups.length === 0 && modifiedGroups.length === 0 && deletedGroups.length === 0 && deletedSummaries.length === 0) {
            setLoader(false)
            return
        }

        // duplicate dates are not allowed, create another pseudo-location using indexes to track multiple groups at same location
        if (hasDuplicateDates([...jobGroups, ...addedGroups, ...modifiedGroups])) {
            setLoader(false)
            console.log("Duplicate Dates are not Allowed")
            return
        }

        const adding: Job[] = convertSummariesToJobs(flattenDateGroupedJobSummariesToJobSummaries(addedGroups))
        const editing: Job[] = convertSummariesToJobs(flattenDateGroupedJobSummariesToJobSummaries(modifiedGroups))
        const removing: Job[] = [...convertSummariesToJobs(flattenDateGroupedJobSummariesToJobSummaries(deletedGroups)), ...convertSummariesToJobs(deletedSummaries)]

        try {
            const result: GenericError | JobViewProps = await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_EDIT}`, {
                method: "POST",
                body: JSON.stringify({
                    locationId: location.locationId,
                    adding: adding,
                    modifying: editing,
                    removing: removing
                })}).then(middle => {
                    return middle.json()
                }).then(response => {
                    return response
                }
            )
    
            if ((result as GenericError).error) {
                console.log("Fatal Error When Refetching Changes")
                return
            }
    
            setLocation((result as JobViewProps).locationOfJobs)
            setJobGroupsHardCopy(deepCopyDateGroupedJobSummariesArray((result as JobViewProps).jobsAtLocation))
            setJobGroups(deepCopyDateGroupedJobSummariesArray((result as JobViewProps).jobsAtLocation))
            setEmployees((result as JobViewProps).allEmployees)
    
            setAddedGroups([])
            setModifiedGroups([])
            setDeletedGroups([])
            setDeletedSummaries([])
        }
        catch (error) {
            console.log(error)
        }

        setLoader(false)
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
                <h1 className="text-4xl text-green">{location.name}</h1>
                <button onClick={addGroup} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Add Group</button>
                <button onClick={undoChanges} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Cancel</button>
                <button onClick={onSave} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Save</button>
            </header>

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
                                <li key={`EMPLOYEE_STATISTIC_ROW_${index}`}>
                                    <EmployeeStatisticsRow data={row} />
                                </li>
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
                            return <JobGroup 
                                key={group.id} 
                                location={locationOfJobs}
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

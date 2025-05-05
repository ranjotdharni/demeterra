"use client"

import { Employee, Location, JobSummary, Job as JobType, DateGroupedJobSummaries } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import Statistic from "./Statistic"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { Copy, X } from "lucide-react"
import { dateToFormat, parseLocalDateFromInputValue } from "@/lib/utils/general"

export interface StatisticsGroupProps {
    location: Location
    dateOf: Date
    group: JobSummary[]
    employees: Employee[]
    wage: number
    rideCost: number
    duplicate: () => void
    editDate: (newDate: Date) => void
    addJob: (add: JobSummary) => void
    editJob: (edit: JobSummary) => void
    removeJob: (remove: JobSummary) => void
    removeGroup: () => void
}

export default function StatisticsGroup({ location, dateOf, group, employees, wage, rideCost, duplicate, editDate, addJob, editJob, removeJob, removeGroup } : StatisticsGroupProps) {
    const filteredEmployees: Employee[] = employees.filter(e => group.find(g => g.employee.employeeId === e.employeeId) === undefined)
    const [currentSelection, setCurrentSelection] = useState<string>("")

    function onClick(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        const locationOf: Location | undefined = location
        const employee: Employee | undefined = employees.find(e => e.employeeId === currentSelection)

        if (filteredEmployees.length === 0 || !locationOf || !employee)
            return

        const job: JobType = {
            constructor: {
                name: "RowDataPacket"
            },
            jobId: uuidv4(),
            locationId: locationOf.locationId,
            employeeId: employee.employeeId,
            dateOf: new Date(dateOf),
            hoursWorked: 1, 
            rideCost: rideCost,  
            wage: wage
        }

        addJob({
            job: job,
            location: {...locationOf},
            employee: {...employee}
        })
    }

    function editWage(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        if (isNaN(+event.target.value))
            return

        group.forEach(js => {
            const update: JobSummary = {
                ...js,
                job: {
                    ...js.job,
                    wage: +event.target.value
                }
            }

            editJob(update)
        })
    }

    function editRideCost(event: ChangeEvent<HTMLInputElement>) {
        event.preventDefault()

        if (isNaN(+event.target.value))
            return

        group.forEach(js => {
            const update: JobSummary = {
                ...js,
                job: {
                    ...js.job,
                    rideCost: +event.target.value
                }
            }

            editJob(update)
        })
    }

    function createDuplicate(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        duplicate()
    }

    useEffect(() => {
        if (
            filteredEmployees.length > 0 &&
            !filteredEmployees.find(e => e.employeeId === currentSelection)
        ) {
            setCurrentSelection(filteredEmployees[0].employeeId)
        }
    }, [filteredEmployees, currentSelection])

    return (
        <li className="p-2 border rounded border-light-grey inline-flex flex-row items-center space-x-2 w-auto">
            <button onClick={removeGroup} className="hover:text-red-800 hover:cursor-pointer">
                <X />
            </button>

            <div className="min-w-120 p-2 border border-light-grey rounded-lg space-y-2 space-x-2">
                <h3 className="text-xl flex justify-between items-center space-x-2">
                    <input type="date" value={dateToFormat("YYYY-MM-DD", new Date(dateOf))} onChange={e => { editDate(parseLocalDateFromInputValue(e.target.value)) }} />
                    <button onClick={createDuplicate} className="hover:text-green hover:cursor-pointer">
                        <Copy />
                    </button>
                </h3>
                <label>Wage: </label>
                <input type="number" value={`${wage}`} onChange={editWage} className="bg-light-grey w-15" />
                <label>Ride Cost:</label>
                <input type="number" value={`${rideCost}`} onChange={editRideCost} className="bg-light-grey w-15" />
                <select disabled={filteredEmployees.length === 0} value={currentSelection ? currentSelection : ""} onChange={e => setCurrentSelection(e.target.value)}>
                    {
                        filteredEmployees.map((employee, index) => {
                            return <option key={`ADD_EMPLOYEE_SELECT_${index}`} value={employee.employeeId}>{employee.name}</option>
                        })
                    }
                </select>
                <button disabled={filteredEmployees.length === 0} onClick={onClick} className="px-2 bg-light-grey rounded-md">Add</button>
            </div>

            <ul className="flex flex-row space-x-1">
                {
                    group.map(job => {
                        return <Statistic key={job.job.jobId} job={job} editJob={editJob} removeJob={removeJob} />
                    })
                }
            </ul>
        </li>
    )
}

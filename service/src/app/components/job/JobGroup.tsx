"use client"

import { Employee, Location, JobSummary, Job as JobType } from "@/lib/types/db"
import { v4 as uuidv4 } from "uuid"
import Job from "./Job"
import { ChangeEvent, MouseEvent, useEffect, useState } from "react"
import { Cross, X } from "lucide-react"

export interface JobGroupProps {
    location: Location
    dateOf: Date
    group: JobSummary[]
    employees: Employee[]
    wage: number
    rideCost: number
    addJob: (add: JobSummary) => void
    editJob: (edit: JobSummary) => void
    removeJob: (remove: JobSummary) => void
    removeGroup: () => void
}

export default function JobGroup({ location, dateOf, group, employees, wage, rideCost, addJob, editJob, removeJob } : JobGroupProps) {
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

    useEffect(() => {
        if (filteredEmployees.length !== 0) {
            setCurrentSelection(filteredEmployees[0].employeeId)
        }
    }, [filteredEmployees])

    return (
        <li className="p-2 border rounded border-light-grey flex flex-row items-center space-x-2">
            <button className="hover:text-red-800 hover:cursor-pointer">
                <X />
            </button>

            <div className="min-w-60 p-2 border border-light-grey rounded-lg space-y-2 space-x-2">
                <h3 className="text-xl">{new Date(dateOf).toDateString()}</h3>
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
                        return <Job key={job.job.jobId} job={job} editJob={editJob} removeJob={removeJob} />
                    })
                }
            </ul>
        </li>
    )
}

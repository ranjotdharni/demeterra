"use client"

import { Employee, JobSummary } from "@/lib/types/db"
import Job from "./Job"
import { useEffect, useState } from "react"

export interface JobGroupProps {
    dateOf: Date
    group: JobSummary[]
    employees: Employee[]
}

export default function JobGroup({ dateOf, group, employees } : JobGroupProps) {
    const filteredEmployees: Employee[] = employees.filter(e => group.find(g => g.employee.employeeId === e.employeeId) === undefined)
    const [currentSelection, setCurrentSelection] = useState<string>("")

    useEffect(() => {
        if (filteredEmployees.length !== 0) {
            setCurrentSelection(filteredEmployees[0].employeeId)
        }
    }, [filteredEmployees])

    return (
        <li className="p-2 border rounded border-light-grey flex flex-row items-center space-x-4">
            <div className="w-60 p-2 border border-light-grey rounded-lg space-y-2 space-x-2">
                <h3 className="text-xl">{new Date(dateOf).toDateString()}</h3>
                <select disabled={filteredEmployees.length === 0} value={currentSelection ? currentSelection : ""} onChange={e => setCurrentSelection(e.target.value)}>
                    {
                        filteredEmployees.map((employee, index) => {
                            return <option key={`ADD_EMPLOYEE_SELECT_${index}`} value={employee.employeeId}>{employee.name}</option>
                        })
                    }
                </select>
                <button disabled={filteredEmployees.length === 0} className="px-2 bg-light-grey rounded-md">Add</button>
            </div>

            <ul>
                {
                    group.map(job => {
                        return <Job key={job.job.jobId} job={job} />
                    })
                }
            </ul>
        </li>
    )
}

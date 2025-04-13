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
            setCurrentSelection(filteredEmployees[0].employeeId);
        }
    }, [filteredEmployees]);

    return (
        <li className="p-2 border rounded border-light-grey flex flex-row items-center space-x-4">
            <h3 className="text-2xl">{new Date(dateOf).toDateString()}</h3>
            
            <div className="p-1 border border-light-grey rounded-lg">
                <select disabled={filteredEmployees.length === 0} value={currentSelection ? currentSelection : ""} onChange={e => setCurrentSelection(e.target.value)}>
                    {
                        filteredEmployees.map((employee, index) => {
                            return <option key={`ADD_EMPLOYEE_SELECT_${index}`} value={employee.employeeId}>{employee.name}</option>
                        })
                    }
                </select>
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

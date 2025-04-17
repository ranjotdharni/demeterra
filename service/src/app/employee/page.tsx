"use client"

import { API_EMPLOYEE, PAGE_EMPLOYEE } from "@/lib/constants/routes"
import { useEffect, useState } from "react"
import { Employee } from "@/lib/types/db"
import Loader from "../components/utils/Loader"

export default function Page() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [newEmployee, setNewEmployee] = useState<string>("")
    const [loader, setLoader] = useState<boolean>(false)

    async function getEmployees() {
        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_EMPLOYEE}`).then(middle => {
            return middle.json()
        }).then(response => {
            setEmployees(response as Employee[])
        }).finally(() => {
            setLoader(false)
        })
    }

    async function addEmployee() {
        if (newEmployee.length < 1 || newEmployee.length > 64)
            return

        setLoader(true)

        await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_EMPLOYEE}`, {
            method: "POST",
            body: JSON.stringify({
                name: newEmployee
            })
        }).then(middle => {
            return middle.json()
        }).then(response => {
            const returnedEmployee: Employee = response as Employee
            setEmployees([...employees, returnedEmployee])
            setNewEmployee("")
        }).finally(() => {
            setLoader(false)
        })
    }

    useEffect(() => {
        getEmployees()
    }, [])

    return (
        <section className="p-4">
            <header className="w-auto h-auto py-4 space-x-4 flex flex-row items-center border-b border-light-grey">
                <h1 className="text-5xl">Employees</h1>
                <input value={newEmployee} onChange={(e) => {setNewEmployee(e.target.value)}} placeholder="Enter name..." className="w-50 p-1 bg-light-grey text-black" />
                <button onClick={() => addEmployee()} className="p-1 border border-light-grey rounded hover:cursor-pointer">Add Employee</button>
            </header>

            {
                loader ? 
                <div className="w-full h-60 flex flex-col justify-end items-center">
                    <Loader />
                </div> : 
                <ul className="py-2 space-y-4">
                    {
                        employees.map(employee => {
                            return (
                                <li key={employee.employeeId} className="w-auto h-auto px-4 py-2 border border-light-grey rounded-lg flex flex-row items-center space-x-2">
                                    <h2 className="text-2xl">{employee.name}</h2>
                                    <a href={`${PAGE_EMPLOYEE}/${employee.employeeId}`} className="hover:cursor-pointer py-1 px-4 text-foreground border border-light-grey rounded-lg">View</a>
                                    <button className="hover:cursor-pointer py-1 px-4 text-foreground border border-light-grey rounded-lg">Delete</button>
                                </li>
                            )
                        })
                    }
                </ul>
            }
        </section>
    )
}

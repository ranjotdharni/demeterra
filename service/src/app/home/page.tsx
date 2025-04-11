import { PAGE_EMPLOYEE, PAGE_LOCATION } from "@/lib/constants/routes"

export default function Page() {

    return (
        <section className="w-screen h-screen flex flex-col justify-center items-center space-y-8">
            <a href={PAGE_LOCATION} className="p-2 border border-light-grey rounded-lg hover:cursor-pointer">View Locations</a>
            <a href={PAGE_EMPLOYEE} className="p-2 border border-light-grey rounded-lg hover:cursor-pointer">View Employees</a>
        </section>
    )
}

import { PAGE_EMPLOYEE, PAGE_LOCATION, PAGE_NOTE, PAGE_STATISTICS } from "@/lib/constants/routes"

interface DetailBoxType {
    text: string
    href: string
    button: string
}

function DetailBox({ text, href, button } : DetailBoxType) {
    return (
        <li className="w-full h-auto space-y-3 border border-green rounded p-3 flex flex-col items-end">
            <p className="w-full text-lg">{text}</p>
            <a href={href} className="p-2 border border-green rounded-lg hover:cursor-pointer">{button}</a>
        </li>
    )
}

export default function Page() {
    const pageDetails: DetailBoxType[] = [
        {
            text: "Create employees in the Employees page. Once created, employees can be assigned hours at different locations (See below). Demeterra will track employees' total hours and calculate earnings, cost, and revenue for each employee.",
            href: PAGE_EMPLOYEE,
            button: "View Employees"
        },
        {
            text: "Add locations in the Locations page. Once created, you can assign work hours at that location to different employees. Demeterra will track statistics for individual locations accordingly. You cannot delete locations once created; this behavior is intentional since all history of data stored using this app is meant to be tracked forever.",
            href: PAGE_LOCATION,
            button: "View Locations"
        },
        {
            text: "To view fine-tuned statistics for individual or all employees, use the Statistics page. You can even play around with employee data here to see how output would be affected if certain values were different (such as hours worked, minimum wage, ride cost, etc.). The statistics page does not save any changes to the data so you can play around with it freely from this page.",
            href: PAGE_STATISTICS,
            button: "View Statistics"
        },
        {
            text: "You can create notes in the Notes page to keep track of things you need to remember that are indirectly related to employee wage/time tracking. Individual notes take up relatively a lot more space in memory, so be mindful and do not save empty notes.",
            href: PAGE_NOTE,
            button: "View Notes"
        }
    ]

    return (
        <section className="w-full h-auto inline-flex flex-col justify-center items-start space-y-4 p-4">
            <h1 className="w-full p-2 text-4xl text-green border-b">Welcome, Ravneet!</h1>

            <p className="text-xl">
                Navigate between pages using the buttons below or by opening the navigation menu on the top left. Don't forget to save changes you make
                to any data that you add, modify, or delete. When you are done using the app and have saved all your changes, use the button in the 
                bottom of the navigation menu to log out. It is best practice to log out when you are finished using Demeterra to avoid unexpected 
                behavior.
            </p>

            <ul className="space-y-4">
                {
                    pageDetails.map((detail, index) => {
                        return <DetailBox key={`HOME_DETAIL_BOX_${index}`} text={detail.text} href={detail.href} button={detail.button} />
                    })
                }
            </ul>
        </section>
    )
}


interface NotFoundProps {
    message?: string
}

export default function NotFound({ message } : NotFoundProps) {
    return (
        <section className="flex flex-col space-y-4">
            <h1>The page you're looking for was not found.</h1>
            {
                message ? 
                <p>{message}</p> : 
                <></>
            }
        </section>
    )
}

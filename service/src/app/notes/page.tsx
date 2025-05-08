import { dbGetNotes } from "@/db/actions"
import NoteView from "../components/notes/NoteView"
import { GenericError } from "@/lib/types/general"
import NotFound from "../404"
import { Note } from "@/lib/types/db"

export default async function Page() {
    const initial = await dbGetNotes()

    if ((initial as GenericError).error)
        return <NotFound message={(initial as GenericError).message} />

    return (
        <NoteView initial={initial as Note[]} />
    )
}

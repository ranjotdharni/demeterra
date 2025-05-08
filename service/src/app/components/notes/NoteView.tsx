"use client"

import { Note as NoteType } from "@/lib/types/db"
import { MouseEvent, useState } from "react"
import Note from "./Note"
import Loader from "../utils/Loader"
import { GenericError } from "@/lib/types/general"
import { API_NOTE } from "@/lib/constants/routes"

export default function NoteView({ initial } : { initial: NoteType[] }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [createInput, setCreateInput] = useState<string>("")
    const [notes, setNotes] = useState<NoteType[]>(initial)

    async function createNote(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setLoader(true)

        try {
            await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_NOTE}`, {
                method: "POST",
                body: JSON.stringify({
                    content: createInput
                })
            }).then(middle => {
                return middle.json()
            }).then(result => {
                if ((result as GenericError).error) {
                    console.log((result as GenericError).message)
                }
                else {
                    const newNote = result as NoteType
                    const newNotes = [...notes]
                    newNotes.push(newNote)
                    setCreateInput("")
                    setNotes(newNotes)
                }
            })
        }
        catch (error) {
            console.log(error)
        }

        setLoader(false)
    }

    function updateNote(id: string, content: string) {
        const updateIndex: number = notes.findIndex(n => n.noteId === id)

        if (updateIndex === -1)
            return

        let newNotes = [...notes]
        newNotes[updateIndex].content = content
        setNotes(newNotes)
    }

    function removeNote(id: string) {
        const removeIndex: number = notes.findIndex(n => n.noteId === id)

        if (removeIndex === -1)
            return

        let newNotes = [...notes]
        newNotes.splice(removeIndex, 1)
        setNotes(newNotes)
    }

    return (
        <section>
            <h1>Notes</h1>
            {
                loader ? 
                <div className="w-full h-60 flex flex-col justify-end items-center">
                    <Loader />
                </div> :
                <div>
                    <button onClick={createNote}>Create</button>
                    <input type="textarea" value={createInput} onChange={event => { setCreateInput(event.target.value) }} />
                </div>
            }

            <ul>
                {
                    notes.map(note => {
                        return <Note note={note} updateNote={updateNote} removeNote={removeNote} />
                    })
                }
            </ul>
        </section>
    )
}

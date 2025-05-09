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
        let newNote = {...newNotes[updateIndex], content: content}
        newNotes[updateIndex] = newNote
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
        <section className="p-8">
            <h1 className="p-2 text-4xl text-green border-b border-white w-auto">Notes</h1>
            {
                loader ? 
                <div className="w-full h-60 flex flex-col justify-end items-center">
                    <Loader />
                </div> :
                <div className="space-y-2 p-2 flex flex-col items-end border-b">
                    <textarea className="w-full min-h-40 p-2 bg-yellow-100 text-black rounded outline-none" placeholder="Create a Note..." value={createInput} onChange={event => { setCreateInput(event.target.value) }} />
                    <button onClick={createNote} className="px-2 bg-light-grey rounded-md hover:cursor-pointer">Create</button>
                </div>
            }

            <ul>
                {
                    notes.map(note => {
                        return <Note key={note.noteId} note={note} updateNote={updateNote} removeNote={removeNote} />
                    })
                }
            </ul>
        </section>
    )
}

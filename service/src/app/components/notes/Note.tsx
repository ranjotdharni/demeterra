"use client"

import { Note as NoteType } from "@/lib/types/db"
import { MouseEvent, useState } from "react"
import Loader from "../utils/Loader"
import { API_NOTE } from "@/lib/constants/routes"
import { GenericError } from "@/lib/types/general"
import { dateToFormat } from "@/lib/utils/general"

export default function Note({ note, updateNote, removeNote } : { note: NoteType, updateNote: (id: string, content: string) => void, removeNote: (id: string) => void }) {
    const [loader, setLoader] = useState<boolean>(false)
    const [content, setContent] = useState<string>(note.content)

    function undoChanges(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()
        setContent(note.content)
    }

    async function editNote(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setLoader(true)

        try {
            await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_NOTE}`, {
                method: "PUT",
                body: JSON.stringify({
                    id: note.noteId,
                    content: note.content
                })
            }).then(middle => {
                return middle.json()
            }).then(result => {
                if ((result as GenericError).error) {
                    console.log((result as GenericError).message)
                }
                else {
                    updateNote(note.noteId, note.content)
                }
            })
        }
        catch (error) {
            console.log(error)
        }

        setLoader(false)
    }

    async function deleteNote(event: MouseEvent<HTMLButtonElement>) {
        event.preventDefault()

        setLoader(true)

        try {
            await fetch(`${process.env.NEXT_PUBLIC_ORIGIN}${API_NOTE}`, {
                method: "DELETE",
                body: JSON.stringify({
                    id: note.noteId
                })
            }).then(middle => {
                return middle.json()
            }).then(result => {
                if ((result as GenericError).error) {
                    console.log((result as GenericError).message)
                }
                else {
                    removeNote(note.noteId)
                }
            })
        }
        catch (error) {
            console.log(error)
        }

        setLoader(false)
    }

    return (
        <li className="w-full h-auto p-2 space-x-2">
            {
                loader ? 
                <div className="w-full h-60 flex flex-col justify-end items-center">
                    <Loader />
                </div> :
                <>
                    <h2 className="text-xl">{dateToFormat("MMM DD, YYYY", new Date(note.dateOf))}</h2>
                    <button className="px-2 bg-light-grey rounded-md hover:cursor-pointer" onClick={undoChanges}>Undo</button>
                    <button className="px-2 bg-light-grey rounded-md hover:cursor-pointer" onClick={deleteNote}>Delete</button>
                    <button className="px-2 bg-light-grey rounded-md hover:cursor-pointer" onClick={editNote}>Save</button>
                    
                    <input className="w-full min-h-30 p-2" type="textarea" placeholder="Type a Note..." value={content} onChange={event => { setContent(event.target.value) }} />
                </>
            }
        </li>
    )
}

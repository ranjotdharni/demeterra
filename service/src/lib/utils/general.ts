import { GenericError } from "../types/general"

export function newError(message: string): GenericError {
    return { error: true, message: message } as GenericError
}


export const API_LOCATION: string = "/api/location"
export const API_LOGIN: string = "/api/login"

export const PAGE_LOCATION: string = "/location"
export const PAGE_EMPLOYEE: string = "/employee"
export const PAGE_LOGIN: string = "/login"  // not in public routes to handle existing session redirect, see middleware.ts
export const PAGE_HOME: string = "/home"
export const PAGE_LANDING: string = "/"

export const PUBLIC_ROUTES: string[] = [
    API_LOGIN,
    PAGE_LANDING
]

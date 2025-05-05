
export const API_STATISTICS: string = "/api/statistics"
export const API_EMPLOYEE: string = "/api/employee"
export const API_LOCATION: string = "/api/location"
export const API_LOGOUT: string = "/api/logout"
export const API_LOGIN: string = "/api/login"
export const API_EDIT: string = "/api/edit"

export const PAGE_LOCATION: string = "/location"
export const PAGE_EMPLOYEE: string = "/employee"
export const PAGE_STATISTICS: string = "/stats"
export const PAGE_LOGIN: string = "/login"  // not in public routes to handle existing session redirect, see middleware.ts
export const PAGE_HOME: string = "/home"
export const PAGE_LANDING: string = "/"
export const PAGE_JOB: string = "/job"

export const PUBLIC_ROUTES: string[] = [
    API_LOGIN,
    PAGE_LANDING
]

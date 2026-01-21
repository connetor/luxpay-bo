export interface SearchTableParams {
    searchBy?: string | null
    criteria?: string
    startDate: string 
    endDate: string
    page: number
    pageSize: number
    sortBy: string
    sortOrder: string
}
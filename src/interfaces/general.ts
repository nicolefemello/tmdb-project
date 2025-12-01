export interface IMenu {
  name: string
  link?: string
  icon?: string
}

export interface IBaseState {
  isLoading: boolean
  isLoaded: boolean
  error: string | null
  lastUpdated: string | null
}

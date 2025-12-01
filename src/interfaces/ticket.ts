export interface ITicket {
  id: string
  client?: string | null
  reference: string
  theater_movie_title: string
  theater_movie_datetime: string // ISO datetime
  theater_seats: unknown[] // array of seat identifiers
  payment?: unknown | null
  status: 'pending' | 'paid' | 'cancelled'
  created_at?: string
  updated_at?: string
}

export interface ITicketSelection {
  movieId: number | null
  seats: string[]
  totalPrice: number
}

export interface IConfirmedPurchaseSnapshot {
  selection: ITicketSelection
  paymentId: string | number | null
  pixStatus: string | null
  pixAmount: number | null
  pixReference: string | null
  confirmedAt: string
}

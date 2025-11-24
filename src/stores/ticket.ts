import { defineStore } from 'pinia'

export const useTicketStore = defineStore('ticket', {
  state: () => ({
    currentSelection: {
      movieId: null as number | null,
      seats: [] as string[],
      type: 'NORMAL' as 'IMAX' | '3D' | 'NORMAL',
      total: 0,
    },
    history: [] as Array<{
      id: number
      movieId: number
      seats: string[]
      type: string
      total: number
      date: string
    }>,
  }),

  actions: {
    saveSelection(movieId: number, seats: string[], type: string, total: number) {
      this.currentSelection = { movieId, seats, type, total }
    },

    confirmPurchase() {
      if (this.currentSelection.seats.length === 0) return

      this.history.push({
        id: Date.now(),
        movieId: this.currentSelection.movieId!,
        seats: [...this.currentSelection.seats],
        type: this.currentSelection.type,
        total: this.currentSelection.total,
        date: new Date().toISOString(),
      })

      // limpa seleção
      this.currentSelection = {
        movieId: null,
        seats: [],
        type: 'NORMAL',
        total: 0,
      }
    },
  },
})

import type { ITicket } from '@/interfaces/ticket'
import api from '@/plugins/axios'

export default class TicketService {
  static async createTicket(ticketData: Partial<ITicket>): Promise<ITicket> {
    const { data } = await api.post('/tickets/', ticketData)
    return data
  }
}

import { defineStore } from 'pinia'
import { reactive } from 'vue'
import type { IBaseState } from '@/interfaces/general'
import type { ITicket, ITicketSelection, IConfirmedPurchaseSnapshot } from '@/interfaces/ticket'
import type {
  IPixPaymentRequest,
  IPixPaymentResponse,
  IPixPointOfInteraction,
  IPixTransactionData,
  IPixTransactionDetails,
} from '@/interfaces/payment'
import TicketService from '@/services/TicketService'
import PaymentService from '@/services/PaymentService'
import type { PersistenceOptions } from 'pinia-plugin-persistedstate'
interface ITicketState extends IBaseState {
  tickets: ITicket[]
  history: ITicketSelection[]
  selection: ITicketSelection
  response: string | null
  pixPayment: IPixPaymentResponse | null
  pixIsLoading: boolean
  pixError: string | null
  lastConfirmedPurchase: IConfirmedPurchaseSnapshot | null
}

const defaultSelection: ITicketSelection = {
  movieId: null,
  seats: [],
  totalPrice: 0,
}

const createTicketState = (): ITicketState => ({
  tickets: [],
  history: [],
  selection: { ...defaultSelection },
  response: null,
  pixPayment: null,
  pixIsLoading: false,
  pixError: null,
  lastConfirmedPurchase: null,
  isLoading: false,
  isLoaded: false,
  error: null,
  lastUpdated: null,
})

const assignDefinedValues = <T extends object>(target: T, source: Partial<T>) => {
  Object.entries(source).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      target[key as keyof T] = value as T[keyof T]
    }
  })
}

const mergeTransactionData = (
  current: IPixTransactionData | null | undefined,
  incoming: IPixTransactionData | null | undefined,
): IPixTransactionData | null => {
  if (!current) return incoming ?? null
  if (!incoming) return current
  const merged: IPixTransactionData = { ...current }
  assignDefinedValues(merged, incoming)
  return merged
}

const mergePointOfInteraction = (
  current: IPixPointOfInteraction | null | undefined,
  incoming: IPixPointOfInteraction | null | undefined,
): IPixPointOfInteraction | null => {
  if (!current) return incoming ?? null
  if (!incoming) return current
  const merged: IPixPointOfInteraction = { ...current }
  const incomingClone: Partial<IPixPointOfInteraction> = { ...incoming }
  if ('transaction_data' in incomingClone) {
    merged.transaction_data = mergeTransactionData(
      current.transaction_data,
      incomingClone.transaction_data ?? null,
    )
    delete incomingClone.transaction_data
  }
  assignDefinedValues(merged, incomingClone)
  return merged
}

const mergeTransactionDetails = (
  current: IPixTransactionDetails | null | undefined,
  incoming: IPixTransactionDetails | null | undefined,
): IPixTransactionDetails | null => {
  if (!current) return incoming ?? null
  if (!incoming) return current
  const merged: IPixTransactionDetails = { ...current }
  assignDefinedValues(merged, incoming)
  return merged
}

const mergePixPaymentResponse = (
  current: IPixPaymentResponse | null,
  incoming: IPixPaymentResponse,
): IPixPaymentResponse => {
  if (!current) return incoming
  const merged: IPixPaymentResponse = { ...current }
  const {
    point_of_interaction: incomingPoi,
    transaction_details: incomingDetails,
    ...incomingRest
  } = incoming

  assignDefinedValues(merged, incomingRest as Partial<IPixPaymentResponse>)

  if (incomingPoi !== undefined) {
    merged.point_of_interaction = mergePointOfInteraction(current.point_of_interaction, incomingPoi)
  }

  if (incomingDetails !== undefined) {
    merged.transaction_details = mergeTransactionDetails(
      current.transaction_details,
      incomingDetails,
    )
  }

  return merged
}

export const useTicketStore = defineStore(
  'ticket',
  () => {
    const state = reactive<ITicketState>(createTicketState())

    const setLoading = (loading: boolean) => {
      state.isLoading = loading
    }

    const setError = (message: string | null) => {
      state.error = message
    }

    const resetSelection = () => {
      Object.assign(state.selection, defaultSelection)
    }

    const saveSelection = (movieId: number, seats: string[], totalPrice: number) => {
      state.selection.movieId = movieId
      state.selection.seats = seats
      state.selection.totalPrice = totalPrice
      state.lastUpdated = new Date().toISOString()
    }

    const confirmPurchase = () => {
      try {
        setLoading(true)
        if (state.selection.seats.length === 0) {
          throw new Error('Selecione pelo menos um assento')
        }
        state.isLoaded = true
        state.lastUpdated = new Date().toISOString()
        state.response = 'Compra confirmada'
        state.history.push({ ...state.selection })
        const numericAmountCandidates = [
          state.pixPayment?.transaction_details?.total_paid_amount,
          state.pixPayment?.transaction_amount,
          state.pixPayment?.amount,
          state.selection.totalPrice,
        ]
        const resolvedAmount = numericAmountCandidates.reduce<number | null>((acc, value) => {
          if (acc !== null) return acc
          if (value === undefined || value === null) return null
          const numberValue = typeof value === 'number' ? value : Number(value)
          return Number.isNaN(numberValue) ? null : numberValue
        }, null)

        state.lastConfirmedPurchase = {
          selection: { ...state.selection },
          paymentId: state.pixPayment?.id ?? null,
          pixStatus: state.pixPayment?.status ?? null,
          pixAmount: resolvedAmount ?? state.selection.totalPrice,
          pixReference: state.pixPayment?.external_reference ?? null,
          confirmedAt: new Date().toISOString(),
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao confirmar a compra'
        setError(message)
        throw new Error(message)
      } finally {
        setLoading(false)
      }
    }

    const resetPixPayment = () => {
      state.pixPayment = null
      state.pixError = null
    }

    const requestPixPayment = async (payload: IPixPaymentRequest) => {
      state.pixError = null
      state.pixIsLoading = true
      try {
        const response = await PaymentService.createPixPayment(payload)
        state.pixPayment = response
        state.lastUpdated = new Date().toISOString()
        return response
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao gerar pagamento PIX'
        state.pixError = message
        throw new Error(message)
      } finally {
        state.pixIsLoading = false
      }
    }

    const checkPixPaymentStatus = async (paymentId: string | number | undefined | null) => {
      if (!paymentId) return null
      try {
        const response = await PaymentService.fetchPixPaymentStatus(String(paymentId))
        if (response) {
          state.pixPayment = mergePixPaymentResponse(state.pixPayment, response)
          state.lastUpdated = new Date().toISOString()
        }
        return response
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao consultar status do PIX'
        state.pixError = message
        console.error('[PIX] Status check failed:', error)
        return null
      }
    }

    const postNewTicket = async (ticketData: Partial<ITicket>) => {
      setError(null)
      try {
        setLoading(true)
        const ticket = await TicketService.createTicket(ticketData)
        state.tickets.push(ticket)
        state.response = `Ticket ${ticket.reference ?? ''} criado com sucesso`.trim()
        state.lastUpdated = new Date().toISOString()
        state.isLoaded = true
        resetSelection()
        return ticket
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao criar ticket'
        setError(message)
        throw new Error(message)
      } finally {
        setLoading(false)
      }
    }

    return {
      state,
      saveSelection,
      confirmPurchase,
      requestPixPayment,
      checkPixPaymentStatus,
      postNewTicket,
      resetSelection,
      resetPixPayment,
    }
  },
  {
    persist: {
      enabled: true,
      strategies: [
        {
          key: 'tmdb_ticket_store',
          storage: localStorage,
          paths: [
            'state.history',
            'state.selection',
            'state.tickets',
            'state.lastConfirmedPurchase',
          ],
        },
      ],
    } as PersistenceOptions,
  },
)

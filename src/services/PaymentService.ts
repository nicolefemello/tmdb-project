import type { IPixPaymentRequest, IPixPaymentResponse } from '@/interfaces/payment'
import api from '@/plugins/axios'

const PIX_BASE_URL = 'http://localhost:8000/api/payments/pix/'

export default class PaymentService {
  static async createPixPayment(payload: IPixPaymentRequest): Promise<IPixPaymentResponse> {
    const { data } = await api.post<IPixPaymentResponse>(PIX_BASE_URL, payload)
    return data
  }

  static async fetchPixPaymentStatus(paymentId: string): Promise<IPixPaymentResponse> {
    const { data } = await api.get<IPixPaymentResponse>(`${PIX_BASE_URL}webhook/`, {
      params: { payment_id: paymentId },
    })
    return data
  }
}

export interface IPixPayer {
  email: string
  first_name: string
  last_name: string
  document_type: string
  document_number: string
}

export interface IPixPaymentRequest {
  amount: string
  description: string
  payer: IPixPayer
  external_reference: string
}

export interface IPixCollectorInfo {
  account_holder_name?: string | null
}

export interface IPixBankInfo {
  collector?: IPixCollectorInfo | null
}

export interface IPixTransactionData {
  ticket_url?: string | null
  qr_code?: string | null
  qr_code_base64?: string | null
  bank_info?: IPixBankInfo | null
}

export interface IPixTransactionDetails {
  total_paid_amount?: number | string | null
  net_received_amount?: number | string | null
  installment_amount?: number | string | null
}

export interface IPixPointOfInteraction {
  transaction_data?: IPixTransactionData | null
}

export interface IPixPaymentResponse {
  id?: string
  amount?: string | number
  description?: string
  qr_code?: string
  qr_code_base64?: string
  qr_code_text?: string
  copy_and_paste?: string
  expires_at?: string
  external_reference?: string
  transaction_amount?: number | string
  currency_id?: string
  status?: string
  status_detail?: string
  date_of_expiration?: string
  point_of_interaction?: IPixPointOfInteraction | null
  transaction_details?: IPixTransactionDetails | null
  [key: string]: unknown
}

export interface IPixUserForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  documentNumber: string
}

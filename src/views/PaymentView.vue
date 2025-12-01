<script setup lang="ts">
import { reactive, computed, watch, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { GeneralInput } from '@/components'
import { useMovieStore } from '@/stores/movie'
import { useTicketStore } from '@/stores/ticket'
import type { IPixUserForm } from '@/interfaces/payment'

const router = useRouter()
const movieStore = useMovieStore()
const ticketStore = useTicketStore()

const createEmptyUser = (): IPixUserForm => ({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  documentNumber: '',
})

const user = reactive<IPixUserForm>(createEmptyUser())

const latestSelection = computed(() => {
  const history = ticketStore.state.history
  if (history.length > 0) {
    return history[history.length - 1]
  }
  return ticketStore.state.selection
})

const purchaseSummary = computed(() => {
  const selection = latestSelection.value
  if (!selection || selection.seats.length === 0) return null

  const movieData = movieStore.movies.find((m) => m.id === selection.movieId)

  return {
    ...selection,
    totalPrice: typeof selection.totalPrice === 'number' ? selection.totalPrice : Number(selection.totalPrice) || 0,
    movieTitle: movieData?.title || 'Filme não encontrado',
    poster: movieData?.poster_path || '',
  }
})

const pixPayment = computed(() => ticketStore.state.pixPayment)
const pixTransactionData = computed(() => pixPayment.value?.point_of_interaction?.transaction_data ?? null)
const pixCurrency = computed(() => pixPayment.value?.currency_id ?? 'BRL')
const pixAmountValue = computed(() => {
  const payment = pixPayment.value
  const selectionTotal = purchaseSummary.value?.totalPrice ?? 0
  const candidates = [
    payment?.transaction_details?.total_paid_amount,
    payment?.transaction_amount,
    payment?.amount,
    selectionTotal,
  ]

  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue
    const numeric = typeof candidate === 'number' ? candidate : Number(candidate)
    if (!Number.isNaN(numeric)) {
      return numeric
    }
  }
  return 0
})
const pixAmountLabel = computed(() => {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: pixCurrency.value,
    minimumFractionDigits: 2,
  })
  return formatter.format(pixAmountValue.value ?? 0)
})
const pixQrCode = computed(() => {
  if (pixTransactionData.value?.qr_code) return pixTransactionData.value.qr_code
  return (
    (pixPayment.value?.qr_code as string | undefined) ||
    (pixPayment.value?.qr_code_text as string | undefined) ||
    ''
  )
})
const pixCopyCode = computed(() => {
  return (
    (pixPayment.value?.copy_and_paste as string | undefined) ||
    (pixPayment.value?.qr_code_text as string | undefined) ||
    pixQrCode.value ||
    ''
  )
})
const pixQrImage = computed(() => {
  const base64 = (pixTransactionData.value?.qr_code_base64 || pixPayment.value?.qr_code_base64) as
    | string
    | undefined
  if (!base64) return ''
  return base64.startsWith('data:image') ? base64 : `data:image/png;base64,${base64}`
})
const pixTicketUrl = computed(() => pixTransactionData.value?.ticket_url ?? '')
const pixReceiverName = computed(
  () => pixTransactionData.value?.bank_info?.collector?.account_holder_name ?? null,
)
const pixStatusLabel = computed(() => pixPayment.value?.status ?? 'pending')
const pixStatusDetail = computed(() => pixPayment.value?.status_detail ?? 'pending_waiting_transfer')
const pixReference = computed(() => pixPayment.value?.external_reference ?? '—')
const pixDescription = computed(() => {
  if (pixPayment.value?.description) return pixPayment.value.description
  return purchaseSummary.value ? `Ingressos para ${purchaseSummary.value.movieTitle}` : 'Pagamento PIX'
})
const pixHasPayment = computed(() => Boolean(pixPayment.value))
const pixPaid = computed(() => {
  const status = pixPayment.value?.status?.toLowerCase()
  return status === 'approved' || status === 'accredited'
})
const pixIsLoading = computed(() => ticketStore.state.pixIsLoading)
const pixError = computed(() => ticketStore.state.pixError)

const pixExpiration = computed(() => {
  const expirationRaw = pixPayment.value?.date_of_expiration ?? pixPayment.value?.expires_at
  const baseDate = expirationRaw
    ? new Date(String(expirationRaw))
    : new Date(Date.now() + 15 * 60 * 1000)
  return baseDate.toLocaleString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  })
})

const PIX_STATUS_POLL_INTERVAL = 5000
let pixStatusIntervalId: ReturnType<typeof setInterval> | null = null

const clearPixStatusPolling = () => {
  if (pixStatusIntervalId) {
    clearInterval(pixStatusIntervalId)
    pixStatusIntervalId = null
  }
}

const triggerPixStatusUpdate = async (paymentId: string | number) => {
  try {
    await ticketStore.checkPixPaymentStatus(String(paymentId))
  } catch (error) {
    console.error('[PIX] Não foi possível atualizar o status do pagamento.', error)
  }
}

const startPixStatusPolling = (paymentId: string | number) => {
  clearPixStatusPolling()
  triggerPixStatusUpdate(paymentId)
  pixStatusIntervalId = setInterval(() => {
    triggerPixStatusUpdate(paymentId)
  }, PIX_STATUS_POLL_INTERVAL)
}

const copyPixCode = async () => {
  if (!pixCopyCode.value) return
  try {
    await navigator.clipboard.writeText(pixCopyCode.value)
    // alert('Código PIX copiado para a área de transferência!')
  } catch (error) {
    console.error(error)
    // alert('Não foi possível copiar automaticamente. Copie o código manualmente.')
  }
}

const buildPixPaymentPayload = () => {
  if (!purchaseSummary.value) return null

  const firstName = user.firstName
  const lastName = user.lastName
  const documentNumber = user.documentNumber

  if (!firstName || !documentNumber || !user.email) {
    // alert('Preencha nome, email e CPF para gerar o PIX.')
    return null
  }

  return {
    amount: purchaseSummary.value.totalPrice.toFixed(2),
    description: `Ingressos para ${purchaseSummary.value.movieTitle}`,
    payer: {
      email: user.email,
      first_name: firstName,
      last_name: lastName || firstName,
      document_type: 'CPF',
      document_number: documentNumber,
    },
    external_reference: `ORDER-${purchaseSummary.value.movieId ?? 'MOV'}-${Date.now()}`,
  }
}

watch(
  pixPaid,
  async (wasPaid) => {
    if (!wasPaid) return
    clearPixStatusPolling()
    try {
      ticketStore.confirmPurchase()
      // alert('Pagamento aprovado! Compra confirmada.')
      const confirmedId = pixPayment.value?.id ?? latestSelection.value?.movieId ?? 'pix'
      await router.push({ name: 'confirmed-payment', params: { id: confirmedId } })
    } catch (error) {
      console.error('Erro ao confirmar a compra automaticamente.', error)
    } finally {
      Object.assign(user, createEmptyUser())
    }
  },
  { immediate: false },
)

watch(
  () => pixPayment.value?.id ?? null,
  (paymentId) => {
    if (paymentId && !pixPaid.value) {
      startPixStatusPolling(paymentId)
    } else {
      clearPixStatusPolling()
    }
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  clearPixStatusPolling()
})

async function onSubmit() {
  if (!purchaseSummary.value) {
    alert('Selecione seus assentos antes de finalizar a compra.')
    return
  }

  try {
    const pixPayload = buildPixPaymentPayload()
    if (!pixPayload) return

    ticketStore.resetPixPayment()
    await ticketStore.requestPixPayment(pixPayload)
    // alert('PIX gerado! Utilize o código ao lado para concluir o pagamento no seu banco.')
  } catch (error) {
    console.error(error)
    // alert('Não foi possível gerar o PIX. Verifique os dados e tente novamente.')
  }
}
</script>

<template>
  <div class="flex gap-10 px-5 lg:px-20 pt-10 pb-20 text-white">
    <section class="px-20 w-[70%]">
      <button class="flex gap-2 items-center group cursor-pointer" @click="router.back()">
        <span
          class="material-symbols-outlined group-hover:-translate-x-1 transition duration-300">arrow_back</span>Voltar
      </button>
      <h1 class="text-4xl font-semibold my-5">Finalizar compra</h1>

      <div class="content-display min-h-[300px]">
        <form @submit.prevent="onSubmit" class="grid gap-4">
          <div class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
            <h2 class="text-3xl font-semibold mb-4">Dados pessoais</h2>

            <div class="grid gap-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GeneralInput id="first-name" label="Nome" v-model="user.firstName" />
                <GeneralInput id="last-name" label="Sobrenome" v-model="user.lastName" />
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GeneralInput id="email" label="Email" type="email" v-model="user.email" />
                <GeneralInput id="phone" label="Telefone" v-model="user.phone" />
              </div>
              <GeneralInput id="cpf" label="CPF" v-model="user.documentNumber" />
            </div>
          </div>

          <div class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
            <h2 class="text-3xl font-semibold mb-4">Pagamento via PIX</h2>

            <div class="grid gap-4">
              <p class="text-gray-300">
                Escaneie o QR Code do seu app bancário ou copie o código PIX abaixo. O código expira em
                <strong>{{ pixExpiration }}</strong>.
              </p>

              <div class="bg-[#0d0d0d] border border-dashed border-[#555] rounded-lg p-4 flex flex-col gap-3">
                <div v-if="pixIsLoading" class="text-center text-gray-400">Gerando PIX...</div>
                <template v-else>
                  <div v-if="!pixHasPayment" class="text-center text-gray-400 text-sm py-10">
                    Clique em “Gerar PIX” para criar o código de pagamento.
                  </div>
                  <template v-else>
                    <div class="space-y-6">


                      <div>
                        <p class="text-xs uppercase tracking-wide text-gray-500">QR Code</p>
                        <div
                          class="mt-2 flex items-center justify-center border border-[#333] rounded-md bg-white/90 p-4 h-52">
                          <img v-if="pixQrImage" :src="pixQrImage" alt="QR Code PIX"
                            class="w-full max-w-[200px] object-contain" />
                          <span v-else class="text-xs text-gray-500">Imagem não disponível</span>
                        </div>
                      </div>

                      <div class="flex flex-col gap-3">
                        <label class="text-xs uppercase tracking-wide text-gray-500">Código copiar/colar</label>
                        <textarea readonly
                          class="bg-transparent border border-[#333333] rounded-md p-3 text-sm text-gray-100 resize-none h-24"
                          :value="pixCopyCode || 'Gere o PIX para copiar o código completo'"></textarea>
                        <button type="button"
                          class="w-full py-2 bg-[#990033] rounded-md font-semibold hover:scale-105 transition disabled:bg-gray-600 disabled:cursor-not-allowed"
                          @click="copyPixCode" :disabled="!pixCopyCode">
                          Copiar código completo
                        </button>
                      </div>
                      <div class="bg-black/40 border border-[#333] rounded-lg p-4 flex flex-col gap-3">
                        <div class="flex items-center justify-between">
                          <p class="text-xs uppercase tracking-wide text-gray-500">Comprovante</p>
                          <a v-if="pixTicketUrl" :href="pixTicketUrl" target="_blank" rel="noopener"
                            class="text-xs text-[#ff0055] underline">
                            Ver comprovante
                          </a>
                        </div>
                        <p class="text-sm text-gray-200">
                          <strong>Status:</strong> {{ pixStatusLabel }}
                        </p>
                        <p class="text-xs text-gray-500">{{ pixStatusDetail }}</p>
                        <p class="text-sm text-gray-200">
                          <strong>Valor:</strong> {{ pixAmountLabel }}
                        </p>
                        <p class="text-sm text-gray-200">
                          <strong>Descrição:</strong> {{ pixDescription }}
                        </p>
                        <p class="text-sm text-gray-200">
                          <strong>Referência:</strong> {{ pixReference }}
                        </p>
                        <p class="text-sm text-gray-200">
                          <strong>Expira em:</strong> {{ pixExpiration }}
                        </p>
                        <p v-if="pixReceiverName" class="text-sm text-gray-200">
                          <strong>Recebedor:</strong> {{ pixReceiverName }}
                        </p>
                      </div>
                    </div>
                  </template>
                </template>
              </div>

              <p v-if="pixError" class="text-sm text-red-400">{{ pixError }}</p>

              <p class="text-sm text-gray-400">
                Depois de gerar o PIX, conclua o pagamento no aplicativo do seu banco e retorne a esta página para
                acompanhar a confirmação.
              </p>
            </div>
          </div>
          <button type="submit"
            class="w-full py-3 bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] rounded-lg font-semibold transition duration-300 cursor-pointer ml-auto block hover:scale-105">
            Gerar PIX
          </button>
        </form>
      </div>
    </section>

    <div class="border border-[#333333] rounded-lg px-10 py-5 w-[30%] h-[300px]">
      <h2 class="text-2xl font-semibold mb-5">Resumo do Pedido</h2>

      <p class="flex gap-2 items-center text-gray-400 text-lg font-semibold">
        <span class="material-symbols-outlined">group</span>
        <template v-if="purchaseSummary">
          {{ `${purchaseSummary.seats.length} ${purchaseSummary.seats.length === 1 ? 'ingresso' : 'ingressos'}` }}
        </template>
        <template v-else>
          Nenhum assento selecionado
        </template>
      </p>

      <h3 class="mt-5 font-semibold">Assentos:</h3>
      <p v-if="!purchaseSummary" class="text-gray-500">Nenhum assento selecionado</p>
      <ul v-else class="flex gap-3 my-2">
        <li v-for="seat in purchaseSummary.seats" :key="seat" class="py-1 px-5 rounded-full bg-[#990033]">
          {{ seat }}
        </li>
      </ul>

      <hr class="my-5 border-gray-600" />

      <h3 class="mt-5 flex justify-between text-2xl font-semibold">
        Total:
        <span class="text-[rgb(255,0,85)]">
          {{
            purchaseSummary
              ? `R$ ${purchaseSummary.totalPrice.toFixed(2).replace('.', ',')}`
              : 'Selecione assentos'
          }}
        </span>
      </h3>
    </div>
  </div>
</template>

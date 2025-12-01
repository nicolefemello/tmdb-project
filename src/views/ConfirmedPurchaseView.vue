<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTicketStore } from '@/stores/ticket'
import { useMovieStore } from '@/stores/movie'

const route = useRoute()
const router = useRouter()
const ticketStore = useTicketStore()
const movieStore = useMovieStore()

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(value)

const purchaseSnapshot = computed(() => {
  if (ticketStore.state.lastConfirmedPurchase) {
    return ticketStore.state.lastConfirmedPurchase
  }
  const history = ticketStore.state.history
  if (history.length === 0) return null
  return {
    selection: history[history.length - 1],
    paymentId: ticketStore.state.pixPayment?.id ?? null,
    pixStatus: ticketStore.state.pixPayment?.status ?? null,
    pixAmount: ticketStore.state.pixPayment?.transaction_amount
      ? Number(ticketStore.state.pixPayment.transaction_amount)
      : history[history.length - 1].totalPrice,
    pixReference: ticketStore.state.pixPayment?.external_reference ?? null,
    confirmedAt: ticketStore.state.lastUpdated ?? new Date().toISOString(),
  }
})

const selection = computed(() => purchaseSnapshot.value?.selection ?? null)
const seatList = computed(() => selection.value?.seats ?? [])
const hasPurchase = computed(() => Boolean(selection.value && seatList.value.length > 0))

const movieDetails = computed(() => {
  if (!selection.value?.movieId) return null
  const id = selection.value.movieId
  return (
    movieStore.movies.find((movie) => movie.id === id) ??
    movieStore.upcomingMovies.find((movie) => movie.id === id) ??
    null
  )
})

const movieTitle = computed(() => movieDetails.value?.title ?? 'Compra recente')
const posterUrl = computed(() =>
  movieDetails.value?.poster_path
    ? `https://image.tmdb.org/t/p/w500${movieDetails.value.poster_path}`
    : null,
)
const backdropStyle = computed(() => {
  if (!movieDetails.value?.backdrop_path) return {}
  return {
    backgroundImage: `linear-gradient(120deg, rgba(19,19,19,0.95) 30%, rgba(19,19,19,0.6)), url(https://image.tmdb.org/t/p/original${movieDetails.value.backdrop_path})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
  }
})

const formattedTotal = computed(() => (selection.value ? formatCurrency(selection.value.totalPrice) : '—'))
const pixAmount = computed(() => purchaseSnapshot.value?.pixAmount ?? selection.value?.totalPrice ?? null)
const pixAmountLabel = computed(() => (pixAmount.value !== null ? formatCurrency(pixAmount.value) : formattedTotal.value))

const paymentStatusMap: Record<string, string> = {
  approved: 'Pagamento aprovado',
  accredited: 'Pagamento creditado',
  pending: 'Aguardando pagamento',
  in_process: 'Processando pagamento',
}

const paymentStatus = computed(() => {
  const key = purchaseSnapshot.value?.pixStatus?.toLowerCase() ?? 'approved'
  return paymentStatusMap[key] ?? 'Pagamento confirmado'
})

const paymentReference = computed(() => purchaseSnapshot.value?.pixReference ?? '—')
const paymentId = computed(() => {
  const routeId = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id
  if (typeof routeId === 'string' && routeId.trim().length > 0) return routeId
  return purchaseSnapshot.value?.paymentId ?? '—'
})

const confirmedAt = computed(() => {
  const dateString = purchaseSnapshot.value?.confirmedAt ?? ticketStore.state.lastUpdated ?? null
  if (!dateString) return '—'
  return new Date(dateString).toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const quantityLabel = computed(() => {
  const count = seatList.value.length
  if (count === 0) return 'Nenhum ingresso'
  return `${count} ${count === 1 ? 'ingresso' : 'ingressos'}`
})

const goToHome = () => router.push({ name: 'home' })
const goToTickets = () => {
  if (!selection.value?.movieId) {
    router.push({ name: 'home' })
    return
  }
  router.push({ name: 'tickets', params: { id: selection.value.movieId } })
}
const goToMovies = () => router.push({ name: 'movies' })

onMounted(async () => {
  if (movieStore.movies.length === 0) {
    await movieStore.fetchMovies()
  }
  if (movieStore.upcomingMovies.length === 0) {
    await movieStore.fetchUpcomingMovies()
  }
})

const reminders = [
  'Chegue com 20 minutos de antecedência para evitar filas.',
  'Leve um documento com foto combinado com o CPF informado na compra.',
  'Apresente o QR Code recebido no e-mail ou diretamente no aplicativo.',
  'Trocas de assento devem ser realizadas diretamente na bilheteria.',
]
</script>

<template>
  <section class="min-h-screen w-full px-6 py-16 text-white lg:px-20">
    <div class="mx-auto flex max-w-6xl flex-col gap-6">
      <div class="flex flex-col gap-2 text-center">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[rgb(255,0,85)]/20 text-[rgb(255,0,85)]">
          <span class="material-symbols-outlined text-4xl">check_circle</span>
        </div>
        <p class="text-sm uppercase tracking-[0.4em] text-gray-400">Pagamento confirmado</p>
        <h1 class="text-3xl font-semibold md:text-4xl">Compra concluída com sucesso</h1>
        <p class="text-gray-400">Pedido #{{ paymentId }}</p>
      </div>

      <div v-if="hasPurchase" class="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <article
          class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] p-8 shadow-2xl"
          :style="backdropStyle">
          <div class="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center">
            <div v-if="posterUrl"
              class="h-[220px] w-full overflow-hidden rounded-2xl border border-white/20 shadow-lg lg:w-[200px]">
              <img :src="posterUrl" :alt="movieTitle" class="h-full w-full object-cover" />
            </div>
            <div class="flex flex-1 flex-col gap-3">
              <p class="text-sm uppercase tracking-widest text-gray-300">Ingressos confirmados</p>
              <h2 class="text-3xl font-semibold">{{ movieTitle }}</h2>
              <div class="flex flex-wrap items-center gap-3 text-sm text-gray-300">
                <span class="rounded-full border border-white/20 px-4 py-1">{{ quantityLabel }}</span>
                <span class="rounded-full border border-white/20 px-4 py-1">Assentos: {{ seatList.join(', ') }}</span>
              </div>
              <div class="mt-4 grid gap-2 text-gray-200 md:grid-cols-2">
                <p>
                  <span class="text-sm text-gray-400">Valor pago</span><br />
                  <span class="text-2xl font-semibold text-[rgb(255,0,85)]">{{ pixAmountLabel }}</span>
                </p>
                <p>
                  <span class="text-sm text-gray-400">Status</span><br />
                  <span class="text-lg font-semibold">{{ paymentStatus }}</span>
                </p>
              </div>
            </div>
          </div>
        </article>

        <aside class="flex flex-col gap-4">
          <div class="rounded-2xl border border-[#262626] bg-[#121212] p-6">
            <h3 class="text-lg font-semibold">Resumo do pagamento</h3>
            <dl class="mt-4 space-y-3 text-sm text-gray-300">
              <div class="flex items-center justify-between">
                <dt>Status</dt>
                <dd class="font-semibold text-white">{{ paymentStatus }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>ID do pagamento</dt>
                <dd class="font-mono text-xs text-gray-400">{{ paymentId }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>Referência</dt>
                <dd class="font-mono text-xs text-gray-400">{{ paymentReference }}</dd>
              </div>
              <div class="flex items-center justify-between">
                <dt>Confirmado em</dt>
                <dd>{{ confirmedAt }}</dd>
              </div>
            </dl>
          </div>

          <div class="rounded-2xl border border-[#262626] bg-[#121212] p-6">
            <h3 class="text-lg font-semibold">Detalhes do pedido</h3>
            <ul class="mt-4 space-y-2 text-sm text-gray-300">
              <li class="flex justify-between">
                <span>Filme</span>
                <span class="font-semibold text-white">{{ movieTitle }}</span>
              </li>
              <li class="flex justify-between">
                <span>Ingressos</span>
                <span class="font-semibold text-white">{{ quantityLabel }}</span>
              </li>
              <li class="flex justify-between">
                <span>Assentos</span>
                <span class="font-semibold text-white">{{ seatList.join(', ') }}</span>
              </li>
              <li class="flex justify-between">
                <span>Total</span>
                <span class="font-semibold text-[rgb(255,0,85)]">{{ formattedTotal }}</span>
              </li>
            </ul>
          </div>
        </aside>
      </div>

      <div v-else class="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-[#121212] p-10 text-center">
        <p class="text-lg font-semibold">Nenhuma compra recente encontrada</p>
        <p class="mt-2 text-gray-400">
          Gere um novo pagamento PIX e finalize a compra para visualizar os detalhes por aqui.
        </p>
        <div class="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            class="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            @click="goToMovies">
            Ver filmes
          </button>
          <button
            class="rounded-full bg-[rgb(255,0,85)] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            @click="goToHome">
            Voltar para Home
          </button>
        </div>
      </div>

      <div class="rounded-3xl border border-[#262626] bg-[#121212] p-6">
        <h3 class="text-lg font-semibold">Próximos passos</h3>
        <ul class="mt-4 list-disc space-y-2 pl-5 text-sm text-gray-300">
          <li v-for="(reminder, index) in reminders" :key="index">{{ reminder }}</li>
        </ul>
        <div class="mt-6 flex flex-wrap gap-3">
          <button
            class="rounded-full border border-white/20 px-6 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            @click="goToTickets" :disabled="!hasPurchase" :class="{ 'opacity-60 cursor-not-allowed': !hasPurchase }">
            Ver meus ingressos
          </button>
          <button
            class="rounded-full bg-[rgb(255,0,85)] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            @click="goToHome">
            Voltar para Home
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

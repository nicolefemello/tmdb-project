<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useGenreStore } from '@/stores/genre'
import { useTicketStore } from '@/stores/ticket'

const router = useRouter()
const route = useRoute()
const selectedTime = computed(() => (route.query.time ? String(route.query.time) : null))
const movieStore = useMovieStore()
const genreStore = useGenreStore()
const ticketStore = useTicketStore()

onMounted(async () => {
  await Promise.all([movieStore.fetchMovies(), genreStore.getAllGenres('movie')])
})

const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const occupiedSeats = new Set(['A5', 'A6', 'B7', 'C3', 'C4', 'D8', 'D9', 'E5', 'E6', 'F7'])

const selectedSeats = ref<Set<string>>(new Set())

const toggleSeat = (seat: string) => {
  if (occupiedSeats.has(seat)) return

  if (selectedSeats.value.has(seat)) {
    selectedSeats.value.delete(seat)
  } else {
    selectedSeats.value.add(seat)
  }
}

const getSeatStatus = (seat: string) => {
  if (occupiedSeats.has(seat)) return 'occupied'
  if (selectedSeats.value.has(seat)) return 'selected'
  return 'available'
}
const getSeatLabel = (index: number) => {
  const row = rows[Math.floor((index - 1) / 12)]
  const number = ((index - 1) % 12) + 1
  return `${row}${number}`
}

const type = ref<'IMAX' | '3D' | 'NORMAL'>('3D')
const ticketPrice = computed(() =>
  type.value === 'IMAX' ? 0.01 : type.value === '3D' ? 0.01 : 0.01,
)
const totalPrice = computed(() => selectedSeats.value.size * ticketPrice.value)

const handlePay = () => {
  ticketStore.saveSelection(
    Number(route.params.id),
    Array.from(selectedSeats.value),
    totalPrice.value,
  )

  ticketStore.confirmPurchase()
  router.push(`/pagamento/${route.params.id}`)
}
</script>

<template>
  <div class="flex gap-10 px-5 lg:px-20 pt-10 pb-20 text-white">
    <section class="px-20 w-[70%]">
      <button class="flex gap-2 items-center group cursor-pointer" @click="router.back()">
        <span class="material-symbols-outlined group-hover:-translate-x-1 transition duration-300"
          >arrow_back</span
        >Voltar
      </button>
      <h1 class="text-4xl font-semibold my-5">Selecione seus assentos</h1>

      <div
        class="h-2 bg-gradient-to-r from-transparent via-[#990033] to-transparent w-full mt-10"
      ></div>
      <p class="text-center">TELA</p>
      <p v-if="selectedTime" class="text-center text-[#990033] mt-2">
        Sessão selecionada: {{ selectedTime }}
      </p>

      <div
        class="border border-[#333333] rounded-lg px-10 py-5 mt-5 flex items-center justify-between"
      >
        <ul class="grid gap-2 my-5">
          <li v-for="(row, index) in rows" :key="index" class="py-5">{{ row }}</li>
        </ul>

        <div class="grid grid-cols-12 gap-2 my-5 w-full mx-5">
          <div
            v-for="seat in 96"
            :key="seat"
            @click="toggleSeat(getSeatLabel(seat))"
            :class="[
              'text-center pt-3 pb-1 rounded-t-lg cursor-pointer transition duration-200',
              getSeatStatus(getSeatLabel(seat)) === 'occupied'
                ? 'bg-gray-500 cursor-not-allowed'
                : getSeatStatus(getSeatLabel(seat)) === 'selected'
                  ? 'bg-[#990033]'
                  : 'bg-gray-700 hover:bg-[rgb(255,0,85)]',
            ]"
          >
            <span class="material-symbols-outlined">chair</span>
            <p class="text-xs">{{ getSeatLabel(seat) }}</p>
          </div>
        </div>

        <ul class="grid gap-2 my-5">
          <li v-for="(row, index) in rows" :key="index" class="py-5">{{ row }}</li>
        </ul>
      </div>
    </section>

    <div class="border border-[#333333] rounded-lg px-10 py-5 w-[30%] h-[530px]">
      <h2 class="text-2xl font-semibold mb-5">Resumo da Compra</h2>

      <p class="flex gap-2 items-center text-gray-400 text-lg font-semibold">
        <span class="material-symbols-outlined">group</span>
        {{
          selectedSeats.size === 0
            ? 'Nenhum assento selecionado'
            : `${selectedSeats.size} ${selectedSeats.size === 1 ? 'ingresso' : 'ingressos'}`
        }}
      </p>

      <h3 class="mt-5 font-semibold">Assentos:</h3>
      <p v-if="selectedSeats.size === 0">Nenhum assento selecionado</p>
      <ul class="flex gap-3 my-2">
        <li
          v-for="seat in [...selectedSeats]"
          :key="seat"
          class="py-1 px-5 rounded-full bg-[#990033]"
        >
          {{ seat }}
        </li>
      </ul>

      <hr class="my-5 border-gray-600" />

      <p class="flex justify-between text-lg font-semibold">
        <strong class="text-gray-400">Tipo de ingresso:</strong> {{ type }}
      </p>
      <p class="flex justify-between text-lg font-semibold">
        <strong class="text-gray-400">Preço por ingresso:</strong> R$
        {{ ticketPrice.toFixed(2).replace('.', ',') }}
      </p>
      <p class="flex justify-between text-lg font-semibold">
        <strong class="text-gray-400">Quantidade:</strong> {{ selectedSeats.size }}
      </p>

      <hr class="my-5 border-gray-600" />

      <h3 class="mt-5 flex justify-between text-2xl font-semibold">
        Total: <span class="text-[rgb(255,0,85)]">R$ {{ totalPrice }}</span>
      </h3>
      <button
        :disabled="selectedSeats.size === 0"
        @click="handlePay"
        class="w-full mt-10 bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] py-3 text-xl rounded-lg font-semibold hover:scale-105 transition duration-300 cursor-pointer disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed"
      >
        Pagar agora
      </button>
    </div>
  </div>
</template>

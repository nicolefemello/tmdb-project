<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { GeneralInput } from '@/components'
import { useMovieStore } from '@/stores/movie'
import { useTicketStore } from '@/stores/ticket'

const router = useRouter()
const movieStore = useMovieStore()
const ticketStore = useTicketStore()

const user = reactive({
  name: '',
  email: '',
  phone: '',
  numberCard: '',
  nameCard: '',
  expiration: '',
  cvv: '',
  payment: 'credit-card',
})

const movie = computed(() => {
  const item = ticketStore.history.at(-1)
  if (!item) return null
  const movieData = movieStore.movies.find((m) => m.id === item.movieId)

  return {
    ...item,
    movieTitle: movieData?.title || 'Filme não encontrado',
    poster: movieData?.poster,
  }
})

function onSubmit() {
  console.log('Dados enviados:', user)
  alert('Informações atualizadas com sucesso!')
  router.push(`/pagamento-confirmado/${route.params.id}`)
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
      <h1 class="text-4xl font-semibold my-5">Finalizar compra</h1>

      <div class="content-display min-h-[300px]">
        <form @submit.prevent="onSubmit" class="grid gap-4">
          <div class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
            <h2 class="text-3xl font-semibold mb-4">Dados pessoais</h2>

            <div class="grid gap-4">
              <GeneralInput id="name" label="Nome Completo" v-model="user.name" />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <GeneralInput id="email" label="Email" type="email" v-model="user.email" />
                <GeneralInput id="phone" label="Telefone" v-model="user.phone" />
              </div>
            </div>
          </div>

          <div class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
            <h2 class="text-3xl font-semibold mb-4">Forma de pagamento</h2>

            <div class="grid gap-4">
              <fieldset class="grid gap-4">
                <label
                  class="w-full p-2 rounded-lg bg-[#252525] border border-[#333333] text-white cursor-pointer flex items-center peer-checked:border-[rgb(255,0,85)] has-[:checked]:border-[rgb(255,0,85)]"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="credit-card"
                    v-model="user.payment"
                    class="peer hidden"
                  />

                  <span class="material-symbols-outlined ml-5 mr-2">credit_card</span>
                  Cartão de crédito
                </label>

                <label
                  class="w-full p-2 rounded-lg bg-[#252525] border border-[#333333] text-white cursor-pointer flex items-center has-[:checked]:border-[rgb(255,0,85)]"
                >
                  <input
                    type="radio"
                    name="payment"
                    value="pix"
                    v-model="user.payment"
                    class="peer hidden"
                  />

                  <span class="material-symbols-outlined ml-5 mr-2">mobile_2</span>
                  PIX
                </label>
              </fieldset>

              <div v-if="user.payment === 'credit-card'" class="grid gap-4">
                <GeneralInput
                  id="number-card"
                  label="Número do Cartão"
                  type="number"
                  v-model="user.numberCard"
                />
                <GeneralInput id="name-card" label="Nome no Cartão" v-model="user.nameCard" />
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <GeneralInput
                    id="expiration"
                    label="Validade"
                    type="date"
                    v-model="user.expiration"
                  />
                  <GeneralInput id="cvv" label="CVV" type="number" v-model="user.cvv" />
                </div>
              </div>
              <p v-else class="text-center text-gray-400">
                O código PIX será gerado na próxima etapa
              </p>
            </div>
          </div>
          <button
            type="submit"
            class="w-full py-3 bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] rounded-lg font-semibold transition duration-300 cursor-pointer ml-auto block hover:scale-105"
          >
            Finalizar Compra
          </button>
        </form>
      </div>
    </section>

    <div class="border border-[#333333] rounded-lg px-10 py-5 w-[30%] h-[300px]">
      <h2 class="text-2xl font-semibold mb-5">Resumo do Pedido</h2>

      <p class="flex gap-2 items-center text-gray-400 text-lg font-semibold">
        <span class="material-symbols-outlined">group</span>
        {{ `${movie.seats.length} ${movie.seats.length === 1 ? 'ingresso' : 'ingressos'}` }}
      </p>

      <h3 class="mt-5 font-semibold">Assentos:</h3>
      <ul class="flex gap-3 my-2">
        <li v-for="seat in movie.seats" :key="seat" class="py-1 px-5 rounded-full bg-[#990033]">
          {{ seat }}
        </li>
      </ul>

      <hr class="my-5 border-gray-600" />

      <h3 class="mt-5 flex justify-between text-2xl font-semibold">
        Total:
        <span class="text-[rgb(255,0,85)]">R$ {{ movie.total.toFixed(2).replace('.', ',') }}</span>
      </h3>
    </div>
  </div>
</template>

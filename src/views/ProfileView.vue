<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { GeneralInput } from '@/components'
import { useMovieStore } from '@/stores/movie'
import { useTicketStore } from '@/stores/ticket'

const movieStore = useMovieStore()
const ticketStore = useTicketStore()
const selectedMenuId = ref(2)

const selectMenu = (id: number) => {
  selectedMenuId.value = id
}

const menu = [
  { id: 1, section: 'Perfil', icon: 'person' },
  { id: 2, section: 'Histórico', icon: 'local_activity' },
]

onMounted(() => {
  movieStore.fetchMovies()
})

/* eslint-disable @typescript-eslint/no-explicit-any */
const history = computed(() => {
  return ticketStore.state.history.map((item, idx) => {
    const movie = movieStore.movies.find((m) => m.id === item.movieId)

    const rawDate = (item as any).date || (item as any).created_at || ticketStore.state.lastUpdated || null
    const dateObj = rawDate ? new Date(rawDate) : null
    const dateString = dateObj ? dateObj.toLocaleDateString('pt-BR') : '—'
    const hourString = dateObj ? dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : (item as any).hour || '—'
    const total = (item as any).totalPrice ?? (item as any).total ?? 0

    return {
      id: (item as any).id ?? `hist-${idx}`,
      movieTitle: movie?.title || 'Filme não encontrado',
      poster: movie?.poster_path || '',
      date: dateString,
      hour: hourString,
      seats: item.seats || [],
      total,
    }
  })
})
/* eslint-enable @typescript-eslint/no-explicit-any */
function onSubmit() {
  console.log('Dados enviados:', user)
  alert('Informações atualizadas com sucesso!')
}
</script>

<template>
  <section class="px-5 lg:px-20 py-10 w-[50%] mx-auto text-white">
    <h1 class="text-4xl font-bold text-[rgb(255,0,85)]">Minha Conta</h1>

    <ul class="flex gap-4 p-1 bg-[#1a1a1a] rounded-lg w-fit my-8 mx-auto">
      <li v-for="item of menu" :key="item.id" @click="selectMenu(item.id)" :class="[
        'px-6 py-2 rounded-lg text-lg cursor-pointer transition-colors duration-300 flex items-center gap-2',
        selectedMenuId === item.id ? 'bg-white text-black font-semibold' : 'hover:bg-[#252525]',
      ]">
        <span class="material-symbols-outlined">{{ item.icon }}</span> {{ item.section }}
      </li>
    </ul>

    <div class="content-display min-h-[300px]">
      <div v-if="selectedMenuId === 1" class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
        <h2 class="text-3xl font-semibold mb-4">Informações Pessoais</h2>

        <form @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <GeneralInput id="name" label="Nome Completo" v-model="user.name" />
            <GeneralInput id="email" label="Email" type="email" v-model="user.email" />
            <GeneralInput id="phone" label="Telefone" v-model="user.phone" />
            <GeneralInput id="cpf" label="CPF" v-model="user.cpf" />
            <GeneralInput id="address" label="Endereço" v-model="user.address" />
            <GeneralInput id="city" label="Cidade" v-model="user.city" />
            <GeneralInput id="state" label="Estado" v-model="user.state" />
            <GeneralInput id="zipCode" label="CEP" v-model="user.zipCode" />
          </div>

          <button type="submit"
            class="mt-6 px-6 py-2 bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] rounded-lg font-semibold transition duration-300 cursor-pointer ml-auto block hover:scale-105">
            Salvar Alterações
          </button>
        </form>
      </div>

      <div v-else-if="selectedMenuId === 2" class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
        <h2 class="text-3xl font-semibold mb-4">Histórico de Compras</h2>

        <ul v-if="ticketStore.state.history.length != 0" class="max-h-200 overflow-y-auto">
          <li v-for="entry in history" :key="entry.id" class="border-b border-[#333333] py-3 px-5 flex justify-between">
            <div>
              <p class="font-medium">{{ entry.movieTitle }}</p>
              <p class="text-sm text-[#b5b5b5]">
                Data: {{ new Date(entry.date).toLocaleString() }}
              </p>
              <p class="text-sm text-[#b5b5b5]">Assentos: {{ entry.seats.join(', ') }}</p>
            </div>
            <div>
              <p class="text-sm text-[#b5b5b5]">Horário: {{ entry.hour }}</p>
              <p class="font-semibold">R$ {{ entry.total.toFixed(2).replace('.', ',') }}</p>
            </div>
          </li>
        </ul>
        <p v-else>Nenhuma compra registrada.</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useGenreStore } from '@/stores/genre'
import api from '@/plugins/axios'

const route = useRoute()
const movieStore = useMovieStore()
const genreStore = useGenreStore()

const trailerUrl = ref<string | null>(null)
const runtime = ref<number | null>(null)
const director = ref<string | null>(null)
const castList = ref<{ name: string; character: string; profile_path: string | null }[]>([])
const selectedMenuId = ref(1)

const selectMenu = (id: number) => {
  selectedMenuId.value = id
}

onMounted(async () => {
  const movieId = Number(route.params.id)

  await Promise.all([movieStore.fetchMovies(), genreStore.getAllGenres('movie')])

  const existingMovie = movieStore.movies.find((m) => m.id === movieId)
  if (!existingMovie) {
    const response = await api.get(`/movie/${movieId}?language=pt-BR`)
    movieStore.movies.push(response.data)
  }
  try {
    const videosResponse = await api.get(`/movie/${movieId}/videos?language=pt-BR`)
    const trailer = videosResponse.data.results.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube',
    )
    if (trailer) {
      trailerUrl.value = `https://www.youtube.com/embed/${trailer.key}`
    }

    const detailsResponse = await api.get(`/movie/${movieId}?language=pt-BR`)
    runtime.value = detailsResponse.data.runtime

    const creditsResponse = await api.get(`/movie/${movieId}/credits?language=pt-BR`)
    const movieDirector = creditsResponse.data.crew.find((member: any) => member.job === 'Director')
    director.value = movieDirector ? movieDirector.name : 'Desconhecido'
    castList.value = creditsResponse.data.cast.map((actor: any) => ({
      name: actor.name,
      character: actor.character,
      profile_path: actor.profile_path,
    }))
  } catch (error) {
    console.error('Erro ao buscar informações do filme:', error)
  }
})

const movie = computed(() => movieStore.movies.find((m) => m.id === Number(route.params.id)))

const router = useRouter()

const defaultTimes = ['12:00', '15:30', '18:00', '21:15']

const getNextDays = (days = 7) => {
  const result: { label: string; iso: string; times: string[] }[] = []
  for (let i = 0; i < days; i++) {
    const d = new Date()
    d.setDate(d.getDate() + i)
    const iso = d.toISOString().split('T')[0] ?? ''
    const label = d.toLocaleDateString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
    }) as string
    result.push({ label: label ?? '', iso, times: defaultTimes })
  }
  return result
}

const scheduleDays = ref(getNextDays(7))

const selectShowtime = (time: string) => {
  if (!movie.value) return
  router.push({ path: `/tickets/${movie.value.id}`, query: { time } })
}

const menu = [
  { id: 1, section: 'Visão Geral' },
  { id: 2, section: 'Horários' },
  { id: 3, section: 'Elenco' },
]
</script>

<template>
  <div v-if="movie">
    <section class="relative h-[80vh] overflow-hidden">
      <img
        :src="`https://image.tmdb.org/t/p/original${movie.backdrop_path}`"
        :alt="movie.title"
        class="absolute w-full h-full object-cover"
      />
      <div class="absolute w-full h-full bg-gradient-to-b from-transparent to-[#252525]"></div>

      <div class="absolute left-10 bottom-30 z-10 text-white px-4">
        <span
          v-for="genre_id in movie.genre_ids"
          :key="genre_id"
          class="bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] text-white text-sm font-semibold px-4 py-2 mr-3 rounded-lg"
        >
          {{ genreStore.getGenreName(genre_id) }}
        </span>
        <h1 class="text-8xl font-bold drop-shadow-lg">{{ movie.title }}</h1>
        <div class="flex items-center gap-7 my-4">
          <p class="flex gap-2 items-center">
            <span
              class="material-symbols-outlined bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] bg-clip-text text-transparent"
            >
              kid_star
            </span>
            {{ movie.vote_average.toFixed(2) }}
          </p>
          <p class="flex gap-2 items-center text-[#b5b5b5]">
            <span class="material-symbols-outlined"> calendar_today </span
            >{{ new Date(movie.release_date).getFullYear() }}
          </p>
          <p class="flex gap-2 items-center text-[#b5b5b5]">
            <span class="material-symbols-outlined"> pace </span>{{ runtime }} min
          </p>
        </div>

        <div class="flex flex-col sm:flex-row gap-5">
          <button
            class="bg-[rgb(255,0,85)] py-3 px-10 rounded-lg text-lg sm:text-xl text-white font-medium transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg hover:brightness-110 flex items-center gap-2"
          >
            <span class="material-symbols-outlined">play_arrow</span> Ver Trailer
          </button>

          <RouterLink
            :to="`/tickets/${movie.id}`"
            class="border border-[#990033] py-3 px-10 rounded-lg text-lg sm:text-xl text-white font-medium transition-all duration-300 ease-out hover:shadow-md hover:scale-105 hover:brightness-110"
          >
            Comprar Ingressos
          </RouterLink>
        </div>
      </div>
    </section>

    <section class="px-5 lg:px-20 pt-10 pb-20 text-white">
      <ul class="flex gap-4 p-1 bg-[#1a1a1a] rounded-lg w-fit mb-8">
        <li
          v-for="item of menu"
          :key="item.id"
          @click="selectMenu(item.id)"
          :class="[
            'px-6 py-2 rounded-lg text-lg cursor-pointer transition-colors duration-300',
            selectedMenuId === item.id ? 'bg-white text-black font-semibold' : 'hover:bg-[#252525]',
          ]"
        >
          {{ item.section }}
        </li>
      </ul>

      <div class="content-display min-h-[300px]">
        <div v-if="selectedMenuId === 1">
          <h2 class="text-3xl font-bold mb-4">Sinopse</h2>
          <p class="mb-4 lg:w-[60%]">{{ movie.overview }}</p>

          <h3 class="text-2xl font-semibold mb-3">Diretor</h3>
          <p class="mb-4">{{ director }}</p>

          <div v-if="trailerUrl" class="aspect-video w-full h-[85vh] mt-6">
            <h3 class="text-2xl font-semibold mb-3">Trailer Oficial</h3>
            <iframe :src="trailerUrl" class="w-full h-full rounded-xl" allowfullscreen></iframe>
          </div>
          <p v-else class="mt-6">Trailer não disponível</p>
        </div>

        <div v-else-if="selectedMenuId === 2">
          <h2 class="text-3xl font-bold mb-4">Horários</h2>

          <div class="grid gap-6">
            <div v-for="day in scheduleDays" :key="day.iso" class="bg-[#0f0f0f] p-4 rounded-lg">
              <div class="flex items-center justify-between mb-3">
                <div>
                  <p class="font-semibold">{{ day.label }}</p>
                  <p class="text-sm text-gray-400">Data: {{ day.iso }}</p>
                </div>
                <div class="flex gap-3">
                  <button
                    v-for="time in day.times"
                    :key="time"
                    @click="selectShowtime(time)"
                    class="px-4 py-2 bg-[#252525] rounded-md hover:bg-[rgb(255,0,85)] hover:text-white transition"
                  >
                    {{ time }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <p class="mt-4 text-[#990033]">
            *Horários fictícios padrão. Clique em um horário para prosseguir para a compra (será
            direcionado à página de seleção de assentos).
          </p>
        </div>

        <div v-else-if="selectedMenuId === 3">
          <h2 class="text-3xl font-bold mb-4">Elenco</h2>

          <ul class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            <li
              v-for="actor in castList"
              :key="actor.name"
              class="bg-[#1a1a1a] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 text-center text-white"
            >
              <div class="h-90 w-full overflow-hidden">
                <a
                  :href="`https://www.google.com/search?q=${actor.name}`"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    v-if="actor.profile_path"
                    :src="`https://image.tmdb.org/t/p/w300${actor.profile_path}`"
                    :alt="actor.name"
                    class="h-full w-full object-cover"
                  />
                  <div
                    v-else
                    class="w-full h-full flex items-center justify-center bg-gray-700 text-gray-300"
                  >
                    Sem Foto
                  </div>
                </a>
              </div>

              <div class="p-3">
                <p class="font-semibold text-lg">{{ actor.name }}</p>
                <p class="text-sm text-gray-400">{{ actor.character }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </section>
  </div>

  <div
    v-else
    class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
  >
    <div class="flex flex-col items-center gap-4">
      <div
        class="w-14 h-14 border-4 border-white/30 border-t-white rounded-full animate-spin"
      ></div>

      <p class="text-white text-lg font-medium tracking-wide">Carregando...</p>
    </div>
  </div>
</template>

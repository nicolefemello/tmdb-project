<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { MovieCarroussel } from '@/components'
import { useMovieStore } from '@/stores/movie'

const movieStore = useMovieStore()
const currentIndex = ref(0)
let intervalId: number | undefined

const startCarousel = () => {
  intervalId = setInterval(() => {
    if (movieStore.movies.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % movieStore.movies.length
    }
  }, 4000)
}

const upcomingHero = computed(() => movieStore.upcomingMovies[0] ?? null)
const upcomingGrid = computed(() => movieStore.upcomingMovies.slice(1, 7))
const hasUpcoming = computed(() => Boolean(upcomingHero.value))
const skeletonCards = computed(() => Array.from({ length: 4 }, (_, index) => index))

const formatReleaseDate = (date: string | undefined) => {
  if (!date) return 'Data não divulgada'
  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime())
    ? 'Data não divulgada'
    : parsed.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

const truncateOverview = (text: string | undefined, max = 140) => {
  if (!text) return 'Sinopse ainda não disponível para este lançamento.'
  return text.length > max ? `${text.slice(0, max)}...` : text
}

onMounted(async () => {
  await movieStore.fetchMovies()
  await movieStore.fetchUpcomingMovies()
  startCarousel()
})

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<template>
  <div class="relative h-screen overflow-hidden">
    <div
      class="flex h-full transition-transform duration-700 ease-in-out"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div
        v-for="movie in movieStore.movies"
        :key="movie.id"
        class="flex min-w-full flex-col items-center justify-center relative"
      >
        <img
          :src="`https://image.tmdb.org/t/p/original${movie.backdrop_path}`"
          :alt="movie.title"
          class="absolute w-full h-full object-cover"
        />
        <div class="absolute w-full h-full bg-gradient-to-b from-transparent to-[#252525]"></div>

        <div class="absolute left-10 bottom-70 z-10 text-white px-4">
          <h1 class="text-8xl font-bold mb-4 drop-shadow-lg">{{ movie.title }}</h1>
          <p class="max-w-3xl text-lg opacity-90 text-[#F6F6F6]">{{ movie.overview }}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="px-5 py-20 lg:px-20">
    <h2 class="text-3xl font-bold mb-4 text-white px-4">Em cartaz</h2>

    <MovieCarroussel :movies="movieStore.movies" />
  </div>

  <div class="px-5 py-20 lg:px-20">
    <div class="flex flex-wrap items-center justify-between gap-4 px-4">
      <div>
        <p class="text-sm uppercase tracking-[0.4em] text-gray-400">Calendário exclusivo</p>
        <h2 class="text-3xl font-bold text-white">Em breve</h2>
        <p class="mt-1 max-w-xl text-sm text-gray-400">
          Descubra os próximos lançamentos e garanta seus ingressos assim que as vendas abrirem.
        </p>
      </div>
    </div>

    <div v-if="hasUpcoming" class="mt-10 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
      <RouterLink
        :to="`/movies/details/${upcomingHero.id}`"
        class="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#141414] to-[#050505] p-8 group"
      >
        <img
          v-if="upcomingHero?.backdrop_path"
          :src="`https://image.tmdb.org/t/p/original${upcomingHero.backdrop_path}`"
          :alt="upcomingHero.title"
          class="absolute inset-0 h-full w-full object-cover opacity-40 group-hover:scale-105 transition duration-500"
        />
        <div class="relative z-10 flex flex-col gap-6">
          <div>
            <p class="text-xs uppercase tracking-[0.4em] text-gray-300">Destaque</p>
            <h3 class="text-4xl font-bold text-white">{{ upcomingHero?.title }}</h3>
            <p class="mt-2 text-sm text-gray-200">
              Estreia em {{ formatReleaseDate(upcomingHero?.release_date) }}
            </p>
          </div>
          <p class="max-w-2xl text-gray-200">{{ truncateOverview(upcomingHero?.overview, 220) }}</p>
          <div class="flex flex-wrap gap-4">
            <button
              class="rounded-full bg-[rgb(255,0,85)] px-6 py-2 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Ver detalhes
            </button>
          </div>
        </div>
      </RouterLink>

      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
        <RouterLink
          v-for="movie in upcomingGrid"
          :key="movie.id"
          :to="`/movies/details/${movie.id}`"
          class="flex gap-4 rounded-2xl border border-white/10 bg-[#0f0f0f] p-4 hover:-translate-y-1 transition duration-500 hover:border-white"
        >
          <img
            :src="
              movie.poster_path
                ? `https://image.tmdb.org/t/p/w300${movie.poster_path}`
                : '/placeholder.png'
            "
            :alt="movie.title"
            class="h-32 w-24 rounded-xl object-cover"
          />
          <div class="flex flex-1 flex-col justify-between">
            <div>
              <p class="text-xs uppercase tracking-[0.3em] text-gray-400">Estreia</p>
              <h4 class="text-lg font-semibold text-white">{{ movie.title }}</h4>
              <p class="text-sm text-gray-400">{{ formatReleaseDate(movie.release_date) }}</p>
            </div>
            <p class="text-sm text-gray-300">{{ truncateOverview(movie.overview, 100) }}</p>
            <button
              class="mt-2 w-fit rounded-full border border-white/20 px-4 py-1 text-xs font-semibold text-white hover:bg-white/10"
            >
              Ver detalhes
            </button>
          </div>
        </RouterLink>
      </div>
    </div>

    <div v-else class="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <article
        v-for="index in skeletonCards"
        :key="index"
        class="animate-pulse rounded-3xl border border-white/5 bg-[#090909] p-6"
      >
        <div class="h-4 w-24 rounded-full bg-white/10"></div>
        <div class="mt-4 h-6 w-3/4 rounded-full bg-white/20"></div>
        <div class="mt-6 h-24 rounded-2xl bg-white/5"></div>
      </article>
      <div
        class="col-span-full rounded-3xl border border-white/10 bg-[#0c0c0c] p-6 text-center text-gray-400"
      >
        Os próximos lançamentos estão sendo carregados. Volte em instantes ou explore a programação
        atual.
      </div>
    </div>
  </div>
</template>

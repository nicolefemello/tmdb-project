<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useGenreStore } from '@/stores/genre'
import api from '@/plugins/axios'

const route = useRoute()
const movieStore = useMovieStore()
const genreStore = useGenreStore()

const trailerUrl = ref<string | null>(null)
const runtime = ref<number | null>(null)

onMounted(async () => {
  await Promise.all([movieStore.fetchMovies(), genreStore.getAllGenres('movie')])

  const movieId = Number(route.params.id)

  try {
    const videosResponse = await api.get(`/movie/${movieId}/videos?language=en-US`)
    const trailer = videosResponse.data.results.find(
      (v: any) => v.type === 'Trailer' && v.site === 'YouTube',
    )
    if (trailer) {
      trailerUrl.value = `https://www.youtube.com/embed/${trailer.key}`
    }

    const detailsResponse = await api.get(`/movie/${movieId}?language=en-US`)
    runtime.value = detailsResponse.data.runtime
  } catch (error) {
    console.error('Erro ao buscar informações do filme:', error)
  }
})

const movie = computed(() => movieStore.movies.find((m) => m.id === Number(route.params.id)))
</script>

<template>
  <div v-if="movie">
    <div class="relative h-[80vh] overflow-hidden">
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
        <h1 class="text-8xl font-bold mb-4 drop-shadow-lg">{{ movie.title }}</h1>
        <div class="flex items-center gap-7">
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
      </div>
    </div>

    <div class="px-20 py-10 text-white">
      <h1 class="text-3xl font-bold mb-4">{{ movie.title }}</h1>
      <p class="mb-4">{{ movie.overview }}</p>
      <div v-if="trailerUrl" class="aspect-video w-full h-[85vh]">
        <iframe :src="trailerUrl" class="w-full h-full"></iframe>
      </div>
      <p v-else>Trailer não disponível</p>
    </div>
  </div>

  <div v-else>Carregando...</div>
</template>

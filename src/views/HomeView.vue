<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { MovieCarroussel } from '@/components'
import { useMovieStore } from '@/stores/movie'

const store = useMovieStore()
const currentIndex = ref(0)
let intervalId: number | undefined

const startCarousel = () => {
  intervalId = setInterval(() => {
    if (movies.value.length > 0) {
      currentIndex.value = (currentIndex.value + 1) % movies.value.length
    }
  }, 4000)
}

onMounted(async () => {
  await store.fetchMovies()
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
        v-for="movie in store.movies"
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
    <h2 class="text-3xl font-bold mb-4 text-white px-4">Now Playing</h2>

    <MovieCarroussel :movies="store.movies" />
  </div>

  <div class="px-5 py-20 lg:px-20">
    <h2 class="text-3xl font-bold mb-4 text-white px-4">Now Playing</h2>

    <MovieCarroussel :movies="store.movies" />
  </div>

  <div class="px-5 py-20 lg:px-20">
    <h2 class="text-3xl font-bold mb-4 text-white px-4">Now Playing</h2>

    <MovieCarroussel :movies="store.movies" />
  </div>
</template>

<script setup lang="ts">
import type { IMovie } from '@/interfaces/movie'

const props = defineProps<{ movies: IMovie[] }>()
</script>

<template>
  <div class="max-w-screen overflow-hidden">
    <ul class="flex space-x-5 overflow-x-auto pr-5">
      <li
        v-for="movie in props.movies"
        :key="movie.id"
        class="relative rounded-2xl min-w-[300px] h-[500px] lg:min-w-[400px] lg:h-[600px] lg:rounded-md overflow-hidden"
      >
        <RouterLink :to="`/movies/details/${movie.id}`">
          <img
            :src="`https://image.tmdb.org/t/p/original${movie.poster_path}`"
            :alt="movie.title"
            class="w-full h-full object-cover"
          />
        </RouterLink>
      </li>
    </ul>
  </div>
</template>

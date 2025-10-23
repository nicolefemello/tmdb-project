<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMovieStore } from '@/stores/movie'
import { useGenreStore } from '@/stores/genre'
import api from '@/plugins/axios'

const route = useRoute()
const movieStore = useMovieStore()
const genreStore = useGenreStore()

onMounted(async () => {
  await Promise.all([movieStore.fetchMovies(), genreStore.getAllGenres('movie')])
})

const movie = computed(() => movieStore.movies.find((m) => m.id === Number(route.params.id)))
</script>

<template>
  <section class="px-5 lg:px-20 pt-10 pb-20 text-white w-[50%]">
    <button>Voltar</button>
    <h1>Selecione seus assentos</h1>

    <div class="h-2 bg-gradient-to-r from-transparent via-[#990033] to-transparent w-full"></div>
  </section>
</template>

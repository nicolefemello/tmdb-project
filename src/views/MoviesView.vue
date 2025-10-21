<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '../plugins/axios'

const moviesGenres = ref([])

onMounted(async () => {
  let response = await api.get('genre/movie/list?language=en-US')
  moviesGenres.value = response.data.genres
})

const movies = ref([])

const listMovies = async (genreId) => {
  const response = await api.get('discover/movie', {
    params: {
      with_genres: genreId,
      language: 'pt-BR',
    },
  })
  movies.value = response.data.results
}
</script>

<template>
  <h1>Gêneros de filmes</h1>
  <ul>
    <li v-for="genre in moviesGenres" :key="genre.id" @click="listMovies(genre.id)">
      {{ genre.name }}
    </li>
  </ul>

  <div class="movie-list">
    <div v-for="movie in movies" :key="movie.id" class="movie-card">
      <img :src="`https://image.tmdb.org/t/p/w500${movie.poster_path}`" :alt="movie.title" />
      <div class="movie-details">
        <p class="movie-title">{{ movie.title }}</p>
        <p class="movie-release-date">{{ movie.release_date }}</p>
        <p class="movie-genres">{{ movie.genre_ids }}</p>
      </div>
    </div>
  </div>
</template>

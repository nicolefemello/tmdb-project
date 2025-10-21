import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/axios'
import type { IMovie } from '@/interfaces/movie'

export const useMovieStore = defineStore('movie', () => {
  const movies = ref<IMovie[]>([])

  const fetchMovies = async () => {
    try {
      const response = await api.get('movie/now_playing?language=en-US&page=1')
      movies.value = response.data.results
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
    }
  }

  return { movies, fetchMovies }
})

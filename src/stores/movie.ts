import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/plugins/axios'
import type { IMovie } from '@/interfaces/movie'

export const useMovieStore = defineStore('movie', () => {
  const movies = ref<IMovie[]>([])
  const upcomingMovies = ref<IMovie[]>([])

  const fetchMovies = async () => {
    try {
      const response = await api.get('movie/now_playing?language=pt-BR&page=1')
      movies.value = response.data.results
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
    }
  }

  const fetchUpcomingMovies = async () => {
    try {
      const response = await api.get('movie/upcoming?language=pt-BR&page=1&region=BR')
      upcomingMovies.value = response.data.results
    } catch (error) {
      console.error('Erro ao buscar filmes:', error)
    }
  }

  return { movies, upcomingMovies, fetchMovies, fetchUpcomingMovies }
})

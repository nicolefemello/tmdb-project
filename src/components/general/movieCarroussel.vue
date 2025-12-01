<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IMovie } from '@/interfaces/movie'

const props = defineProps<{ movies: IMovie[] }>()

const scrollerRef = ref<HTMLUListElement | null>(null)
const hasMovies = computed(() => props.movies && props.movies.length > 0)

const getPosterUrl = (movie: IMovie) => {
  return movie.poster_path
    ? `https://image.tmdb.org/t/p/original${movie.poster_path}`
    : '/placeholder.png'
}

const scrollByCards = (direction: 'prev' | 'next') => {
  const container = scrollerRef.value
  if (!container) return
  const cardWidth = container.firstElementChild
    ? (container.firstElementChild as HTMLElement).clientWidth
    : 320
  const gap = 24
  const offset = (cardWidth + gap) * 1.5
  container.scrollBy({
    left: direction === 'next' ? offset : -offset,
    behavior: 'smooth',
  })
}
</script>

<template>
  <div class="relative">
    <div v-if="hasMovies" class="relative overflow-hidden rounded-3xl border border-white/10 bg-black/30 px-6 py-10">
      <button type="button" class="carousel-button left" aria-label="Filmes anteriores" @click="scrollByCards('prev')">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <button type="button" class="carousel-button right" aria-label="Próximos filmes" @click="scrollByCards('next')">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>

      <span class="fade-edge left"></span>
      <span class="fade-edge right"></span>

      <ul ref="scrollerRef" class="movie-scroll flex gap-6 overflow-x-auto scroll-smooth pb-6">
        <li v-for="movie in props.movies" :key="movie.id"
          class="group relative min-w-[280px] max-w-[280px] overflow-hidden rounded-[32px] border border-white/10 bg-white/5 shadow-2xl transition duration-500 hover:-translate-y-2 hover:border-[rgb(255,0,85)]/60 lg:min-w-[360px] lg:max-w-[360px]">
          <RouterLink :to="`/movies/details/${movie.id}`" class="block">
            <div class="relative aspect-[2/3] w-full overflow-hidden">
              <img :src="getPosterUrl(movie)" :alt="movie.title"
                class="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
              <span
                class="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/70 opacity-0 transition duration-500 group-hover:opacity-100"></span>
              <div
                class="absolute inset-x-0 bottom-0 flex translate-y-6 flex-col gap-2 px-6 pb-6 text-white transition duration-500 group-hover:translate-y-0">
                <p class="text-xs uppercase tracking-[0.5em] text-gray-300">Em cartaz</p>
                <h3 class="text-2xl font-semibold leading-tight drop-shadow">{{ movie.title }}</h3>
                <div class="flex items-center gap-2 text-sm text-gray-200">
                  <span class="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold">
                    ⭐ {{ movie.vote_average?.toFixed(1) ?? '—' }}
                  </span>
                </div>
              </div>
            </div>
          </RouterLink>
        </li>
      </ul>
    </div>

    <div v-else class="grid gap-4 rounded-3xl border border-white/5 bg-black/40 p-6 text-white lg:grid-cols-4">
      <article v-for="index in 4" :key="index" class="animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4">
        <div class="h-44 rounded-xl bg-white/10"></div>
        <div class="mt-4 h-5 w-3/4 rounded-full bg-white/20"></div>
        <div class="mt-2 h-3 w-1/2 rounded-full bg-white/10"></div>
      </article>
      <p class="col-span-full text-center text-sm text-gray-400">
        Carregando catálogo em cartaz. Explore os destaques ou volte em breve para novidades.
      </p>
    </div>
  </div>
</template>

<style scoped>
.movie-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.movie-scroll::-webkit-scrollbar {
  height: 10px;
}

.movie-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.movie-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
}

.carousel-button {
  position: absolute;
  top: 50%;
  z-index: 20;
  height: 44px;
  width: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transform: translateY(-50%);
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.7);
  color: white;
  transition: transform 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.carousel-button:hover {
  transform: translateY(-50%) scale(1.05);
  border-color: rgb(255, 0, 85);
  color: rgb(255, 0, 85);
}

.carousel-button.left {
  left: 1.25rem;
}

.carousel-button.right {
  right: 1.25rem;
}

.fade-edge {
  position: absolute;
  top: 0;
  z-index: 10;
  height: 100%;
  width: 4rem;
  pointer-events: none;
  background: linear-gradient(to right, rgba(5, 5, 5, 0.95), transparent);
}

.fade-edge.right {
  right: 0;
  transform: rotate(180deg);
}

.fade-edge.left {
  left: 0;
}
</style>

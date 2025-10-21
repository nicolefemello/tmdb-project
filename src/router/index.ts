import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/Default.vue'),
      children: [
        {
          path: '/',
          name: 'home',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/movies',
          name: 'movies',
          component: () => import('../views/MoviesView.vue'),
        },
        {
          path: '/movies/details/:id',
          name: 'movies-details',
          component: () => import('../views/MoviesDetailsView.vue'),
        },
        {
          path: '/popular',
          name: 'popular',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/showtimes',
          name: 'showtimes',
          component: () => import('../views/HomeView.vue'),
        },
        {
          path: '/my-tickets',
          name: 'my-tickets',
          component: () => import('../views/HomeView.vue'),
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

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
          name: 'Movies',
          component: () => import('../views/MoviesView.vue'),
        },
        {
          path: '/movies/details/:id',
          name: 'movies-details',
          component: () => import('../views/MoviesDetailsView.vue'),
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

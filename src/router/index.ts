import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('../layouts/DefaultLayout.vue'),
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
        {
          path: '/tickets/:id',
          name: 'tickets',
          component: () => import('../views/TicketsView.vue'),
        },
        {
          path: '/pagamento/:id',
          name: 'payment',
          component: () => import('../views/PaymentView.vue'),
        },
        {
          path: '/profile',
          name: 'profile',
          component: () => import('../views/ProfileView.vue'),
        },
      ],
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

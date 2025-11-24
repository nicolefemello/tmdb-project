<script setup lang="ts">
import { ref } from 'vue'
import type { IMenu } from '@/interfaces/menuInterface'
import { Notifications } from '@/components'

const menu: IMenu[][] = [
  [
    { name: 'HOME', link: '/' },
    { name: 'MOVIES', link: '/movies' },
    { name: 'POPULAR', link: '/popular' },
    { name: 'SHOWTIMES', link: '/showtimes' },
    { name: 'MY TICKETS', link: '/my-tickets' },
  ],
  [{ icon: 'search', link: '/' }, { icon: 'notifications' }, { icon: 'person', link: '/profile' }],
]

const showPopup = ref(false)
const togglePopup = () => {
  showPopup.value = !showPopup.value
}
</script>

<template>
  <header>
    <nav
      class="hidden lg:flex justify-between items-center px-20 py-4 bg-[#252525] text-white font-semibold"
    >
      <ul class="flex items-center gap-4">
        <li>
          <RouterLink
            to="/"
            class="bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] bg-clip-text text-transparent text-3xl font-bold"
          >
            CINE LUMIÉRE</RouterLink
          >
        </li>
        <li v-for="(item, index) in menu[0]" :key="index">
          <RouterLink :to="item.link" class="p-2">{{ item.name }}</RouterLink>
        </li>
      </ul>

      <ul class="flex items-center gap-4">
        <li v-for="(item, index) in menu[1]" :key="index">
          <span
            v-if="item.icon == 'notifications'"
            @click="togglePopup"
            class="material-symbols-outlined cursor-pointer py-2"
            >{{ item.icon }}</span
          >
          <Notifications
            v-if="item.icon == 'notifications'"
            v-show="showPopup"
            @close="togglePopup"
          />

          <RouterLink v-else :to="item.link">
            <span
              class="material-symbols-outlined cursor-pointer py-2"
              :class="
                item.icon == 'person'
                  ? 'bg-gradient-to-l from-[rgb(255,0,85)] to-[#990033] px-2 rounded-lg hover:scale-110 transition-all'
                  : ''
              "
              >{{ item.icon }}</span
            >
          </RouterLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

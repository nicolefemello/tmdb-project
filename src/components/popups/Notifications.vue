<script setup lang="ts">
const emit = defineEmits(['close'])
const handleOverlayClick = (event: MouseEvent) => {
  if ((event.target as HTMLElement).id === 'overlay') {
    emit('close')
  }
}

const notifications = [
  {
    id: 1,
    icon: 'movie',
    title: 'Novo Lançamento',
    message: 'Cidade Cyberpunk já disponível! Não perca a estreia.',
    time: '2 horas atrás',
    read: false,
  },
]
</script>

<template>
  <div
    id="overlay"
    class="fixed inset-0 z-50 flex items-center justify-center"
    @click="handleOverlayClick"
  >
    <div
      class="absolute top-18 right-20 w-100 bg-[#252525] border border-[#333333] rounded-md shadow-lg p-4 z-60"
    >
      <h3 class="mb-5 pb-5 border-b border-[#333333]">Notificações</h3>

      <p v-if="notifications.length == 0">Você não tem novas notificações.</p>
      <ul v-else>
        <li v-for="notification in notifications" :key="notification.id">
          <div class="flex items-start mb-4 pb-4 border-b border-[#333333]">
            <span
              class="material-symbols-outlined mr-3 p-3 rounded-full bg-[rgb(255,0,85)]/70 text-white scale-85"
              >{{ notification.icon }}</span
            >
            <div>
              <h4 class="font-semibold">{{ notification.title }}</h4>
              <p class="text-sm">{{ notification.message }}</p>
              <span class="text-xs text-gray-500">{{ notification.time }}</span>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

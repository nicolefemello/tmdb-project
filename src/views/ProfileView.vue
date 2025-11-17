<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Input } from '@/components'

const selectedMenuId = ref(2)

const selectMenu = (id: number) => {
  selectedMenuId.value = id
}

const menu = [
  { id: 1, section: 'Perfil', icon: 'person' },
  { id: 2, section: 'Histórico', icon: 'local_activity' },
  { id: 3, section: 'Configurações', icon: 'settings' },
]

const user = reactive({
  name: '',
  email: '',
  phone: '',
  cpf: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
})

function onSubmit() {
  console.log('Dados enviados:', user)
  alert('Informações atualizadas com sucesso!')
}

const history = ref([
  {
    id: 1,
    movie: 'Cidade Cyberpunk',
    date: '11/11/2025',
    assents: ['B8', 'B9'],
    hour: '14:30',
    price: 50,
  },
  {
    id: 2,
    movie: 'Aventura Espacial',
    date: '05/10/2025',
    assents: ['C3', 'C4'],
    hour: '19:00',
    price: 70,
  },
])
</script>

<template>
  <section class="px-5 lg:px-20 py-10 w-[50%] mx-auto text-white">
    <h1 class="text-4xl font-bold text-[rgb(255,0,85)]">Minha Conta</h1>

    <ul class="flex gap-4 p-1 bg-[#1a1a1a] rounded-lg w-fit my-8 mx-auto">
      <li
        v-for="item of menu"
        :key="item.id"
        @click="selectMenu(item.id)"
        :class="[
          'px-6 py-2 rounded-lg text-lg cursor-pointer transition-colors duration-300 flex items-center gap-2',
          selectedMenuId === item.id ? 'bg-white text-black font-semibold' : 'hover:bg-[#252525]',
        ]"
      >
        <span class="material-symbols-outlined">{{ item.icon }}</span> {{ item.section }}
      </li>
    </ul>

    <div class="content-display min-h-[300px]">
      <div v-if="selectedMenuId === 1" class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6">
        <h2 class="text-3xl font-semibold mb-4">Informações Pessoais</h2>

        <form @submit.prevent="onSubmit">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="name" label="Nome Completo" v-model="user.name" />
            <Input id="email" label="Email" type="email" v-model="user.email" />
            <Input id="phone" label="Telefone" v-model="user.phone" />
            <Input id="cpf" label="CPF" v-model="user.cpf" />
            <Input id="address" label="Endereço" v-model="user.address" />
            <Input id="city" label="Cidade" v-model="user.city" />
            <Input id="state" label="Estado" v-model="user.state" />
            <Input id="zipCode" label="CEP" v-model="user.zipCode" />
          </div>

          <button
            type="submit"
            class="mt-6 px-6 py-2 bg-gradient-to-r from-[rgb(255,0,85)] to-[#990033] rounded-lg font-semibold transition duration-300 cursor-pointer ml-auto block hover:scale-105"
          >
            Salvar Alterações
          </button>
        </form>
      </div>

      <div
        v-else-if="selectedMenuId === 2"
        class="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6"
      >
        <h2 class="text-3xl font-semibold mb-4">Histórico de Compras</h2>

        <ul v-if="history" class="max-h-200 overflow-y-auto">
          <li
            v-for="entry in history"
            :key="entry.id"
            class="border-b border-[#333333] py-3 px-5 flex justify-between"
          >
            <div>
              <p class="font-medium">{{ entry.movie }}</p>
              <p class="text-sm text-[#b5b5b5]">Data: {{ entry.date }}</p>
              <p class="text-sm text-[#b5b5b5]">
                Assentos:
                <span v-for="(assent, index) in entry.assents" :key="index">{{ assent }}</span>
              </p>
            </div>
            <div>
              <p class="text-sm text-[#b5b5b5]">Horário: {{ entry.hour }}</p>
              <p class="font-semibold">R$ {{ entry.price.toFixed(2).replace('.', ',') }}</p>
            </div>
          </li>
        </ul>
        <p v-else>Ainda não há histórico de compras.</p>
      </div>

      <div v-else-if="selectedMenuId === 3"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const purchase = ref({
  id: '123456789',
  status: 'Pago',
  hour: '14:30',
  cine: 'CINEFLIX - Shopping Center',
  assents: ['C10'],
  total: 100,
})

const important = [
  'Chegue com 20 minutos de antecedência',
  'Apresente um documento com foto na entrada',
  'O QR Code pode ser apresentado pelo celular ou impresso',
  'Troque de assentos apenas na bilheteria',
]
</script>

<template>
  <section class="mx-auto mt-20 grid items-center gap-4 text-center text-white">
    <span
      class="material-symbols-outlined p-2 rounded-full text-[#990033] scale-180 bg-[rgb(255,0,85)]/20"
      >check_circle</span
    >
    <h1 class="text-2xl font-semibold mt-5">Compra Confirmada!</h1>
    <p class="text-gray-400">
      Obrigado pela sua compra. Seus ingressos foram enviados para o seu e-mail.
    </p>

    <div
      class="min-h-[300px] w-[700px] mx-auto bg-[#1a1a1a] border border-[#333333] rounded-lg text-left"
    >
      <div
        class="flex justify-between items-center bg-gradient-to-r from-[rgb(255,0,85)]/20 to-[#990033]/20 px-10 h-20"
      >
        <p class="flex flex-col text-gray-400">
          Número do Pedido <span class="text-white font-semibold text-xl">{{ purchase.id }}</span>
        </p>
        <p class="text-xl rounded-2xl bg-[#990033] px-5 py-1">{{ purchase.status }}</p>
      </div>
      <div class="grid grid-cols-2 px-10 pt-3 gap-5">
        <p class="flex flex-col text-gray-400">
          Horário da Sessão
          <span class="text-white font-semibold text-xl">{{ purchase.hour }}</span>
        </p>
        <p class="flex flex-col text-gray-400">
          Cinema <span class="text-white font-semibold text-xl">{{ purchase.cine }}</span>
        </p>
        <p class="flex flex-col text-gray-400">
          Assentos
          <span class="text-white font-semibold text-xl">{{ purchase.assents.join(', ') }}</span>
        </p>
      </div>
      <hr class="m-5 border-gray-600" />

      <h3 class="my-5 mx-10 flex justify-between text-2xl font-semibold">
        Total:
        <span class="text-[rgb(255,0,85)]"
          >R$ {{ purchase.total.toFixed(2).replace('.', ',') }}</span
        >
      </h3>
    </div>

    <div
      class="bg-[#990033]/20 border border-[#990033] text-left px-10 py-5 rounded-lg w-[700px] mx-auto mt-5"
    >
      <h1 class="font-semibold">Informações Importantes:</h1>
      <ul class="list-disc ml-5 mt-2 text-gray-400">
        <li v-for="(warning, index) in important" :key="index">{{ warning }}</li>
      </ul>
    </div>
  </section>
</template>

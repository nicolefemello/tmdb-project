<script setup lang="ts">
defineProps({
  modelValue: String,
  label: String,
  id: String,
  type: { type: String, default: 'text' },
})

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div>
    <label :for="id" class="block mb-1 font-medium">
      {{ label }}
    </label>

    <input
      :id="id"
      :type="type"
      :value="modelValue"
      @input="emit('update:modelValue', $event.target.value)"
      class="w-full p-2 rounded-lg bg-[#252525] border border-[#333333] text-white"
    />
  </div>
</template>

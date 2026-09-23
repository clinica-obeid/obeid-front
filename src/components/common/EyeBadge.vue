<script setup>
/** Rótulo de lateralidade do exame — OD, OE ou AO (RFEXA17). */
const props = defineProps({
  olho: { type: String, required: true },
})

const classe = () => `ob-eye ob-eye--${props.olho.toLowerCase()}`
const titulo = { OD: 'Olho direito', OE: 'Olho esquerdo', AO: 'Ambos os olhos' }
</script>

<template>
  <span :class="classe()" :title="titulo[olho] ?? olho">{{ olho }}</span>
</template>

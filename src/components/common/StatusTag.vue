<script setup>
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { useCatalogosStore } from '@/stores/catalogos.js'

/** Status do paciente no fluxo de atendimento (RFAGE02). */
const props = defineProps({ status: { type: String, required: true } })

const catalogos = useCatalogosStore()
const info = computed(() => catalogos.status(props.status))
</script>

<template>
  <Tag :value="info.label" :severity="info.cor" :icon="info.icone ? `pi ${info.icone}` : undefined" />
</template>

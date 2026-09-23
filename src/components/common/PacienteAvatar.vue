<script setup>
import { computed } from 'vue'
import { iniciais } from '@/utils/formato.js'

const props = defineProps({
  nome: { type: String, default: '' },
  tamanho: { type: String, default: 'normal' },
})

const letras = computed(() => iniciais(props.nome))
</script>

<template>
  <span class="avatar" :class="`avatar--${tamanho}`">{{ letras }}</span>
</template>

<style scoped>
.avatar {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
  font-weight: 600;
}
.avatar--normal { width: 34px; height: 34px; font-size: 0.8rem; }
.avatar--grande { width: 52px; height: 52px; font-size: 1.1rem; }
.avatar--pequeno { width: 26px; height: 26px; font-size: 0.7rem; }
</style>

<script setup>
defineProps({
  icone: { type: String, default: 'pi-inbox' },
  titulo: { type: String, default: 'Nada por aqui' },
  descricao: { type: String, default: '' },
})
</script>

<template>
  <div class="vazio">
    <i class="pi" :class="icone" />
    <p class="vazio__titulo">{{ titulo }}</p>
    <p v-if="descricao" class="vazio__desc ob-muted ob-small">{{ descricao }}</p>
    <slot />
  </div>
</template>

<style scoped>
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  padding: 2.5rem 1rem;
  text-align: center;
  border: 1px dashed var(--p-content-border-color);
  border-radius: var(--ob-radius);
  color: var(--p-text-muted-color);
}
.vazio .pi { font-size: 1.75rem; opacity: 0.6; margin-bottom: 0.25rem; }
.vazio__titulo { margin: 0; font-weight: 600; color: var(--p-text-color); }
.vazio__desc { margin: 0; max-width: 46ch; }
</style>

<script setup>
defineProps({
  titulo: { type: String, required: true },
  subtitulo: { type: String, default: '' },
  icone: { type: String, default: '' },
})
</script>

<template>
  <header class="cab">
    <div class="cab__texto">
      <h1 class="cab__titulo">
        <i v-if="icone" class="pi" :class="icone" />
        {{ titulo }}
      </h1>
      <p v-if="subtitulo || $slots.subtitulo" class="cab__sub ob-muted">
        <slot name="subtitulo">{{ subtitulo }}</slot>
      </p>
    </div>
    <div class="cab__acoes">
      <slot name="acoes" />
    </div>
  </header>
</template>

<style scoped>
.cab {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}
.cab__texto { flex: 1; min-width: 200px; }
.cab__titulo { font-size: 1.375rem; display: flex; align-items: center; gap: 0.5rem; }
.cab__titulo .pi { font-size: 1.1rem; color: var(--p-primary-500); }
.cab__sub { margin: 0.25rem 0 0; font-size: 0.875rem; }
.cab__acoes { display: flex; gap: 0.5rem; flex-wrap: wrap; }
</style>

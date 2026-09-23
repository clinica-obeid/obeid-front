<script setup>
import { ref } from 'vue'
import { mascarar } from '@/utils/formato.js'

/**
 * Exibe um dado pessoal mascarado, revelado apenas por ação explícita
 * do usuário — princípio da minimização de dados da LGPD (RNFSEG01).
 */
const props = defineProps({
  valor: { type: String, default: '' },
  tipo: { type: String, default: 'cpf' },
})

const revelado = ref(false)
</script>

<template>
  <span class="mascara">
    <span class="ob-mono">{{ revelado ? props.valor : mascarar(props.valor, props.tipo) }}</span>
    <button
      v-if="props.valor"
      type="button"
      class="mascara__botao"
      :aria-label="revelado ? 'Ocultar dado' : 'Revelar dado'"
      :title="revelado ? 'Ocultar' : 'Revelar dado pessoal'"
      @click.stop.prevent="revelado = !revelado"
    >
      <i class="pi" :class="revelado ? 'pi-eye-slash' : 'pi-eye'" />
    </button>
  </span>
</template>

<style scoped>
.mascara { display: inline-flex; align-items: center; gap: 0.35rem; }
.mascara__botao {
  border: 0;
  background: none;
  padding: 2px;
  cursor: pointer;
  color: var(--p-text-muted-color);
  line-height: 1;
}
.mascara__botao:hover { color: var(--p-primary-600); }
.mascara__botao .pi { font-size: 0.75rem; }
</style>

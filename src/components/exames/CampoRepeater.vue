<script setup>
import Button from 'primevue/button'
import CampoInput from './CampoInput.vue'

/**
 * Campo de série — linhas repetíveis descritas por `campo.colunas`.
 * Usado pela curva tensional diária e pelo teste de sobrecarga hídrica,
 * onde o exame é uma sequência de medições (RFEXA06, RFEXA09).
 */
const props = defineProps({
  campo: { type: Object, required: true },
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const linhas = () => props.modelValue ?? []

function atualizarCelula(indice, chave, valor) {
  const copia = linhas().map((l, i) => (i === indice ? { ...l, [chave]: valor } : l))
  emit('update:modelValue', copia)
}

function adicionar() {
  const vazia = Object.fromEntries(props.campo.colunas.map((c) => [c.key, null]))
  emit('update:modelValue', [...linhas(), vazia])
}

function remover(indice) {
  emit('update:modelValue', linhas().filter((_, i) => i !== indice))
}
</script>

<template>
  <div class="serie">
    <table class="serie__tabela">
      <thead>
        <tr>
          <th v-for="col in campo.colunas" :key="col.key">{{ col.label }}</th>
          <th class="serie__acoes" />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(linha, i) in linhas()" :key="i">
          <td v-for="col in campo.colunas" :key="col.key">
            <CampoInput
              :campo="col"
              :model-value="linha[col.key]"
              compacto
              @update:model-value="(v) => atualizarCelula(i, col.key, v)"
            />
          </td>
          <td class="serie__acoes">
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              :aria-label="`Remover ${campo.rotuloItem ?? 'item'} ${i + 1}`"
              @click="remover(i)"
            />
          </td>
        </tr>
        <tr v-if="!linhas().length">
          <td :colspan="campo.colunas.length + 1" class="ob-muted ob-small serie__vazio">
            Nenhuma medição registrada.
          </td>
        </tr>
      </tbody>
    </table>

    <Button
      :label="`Adicionar ${(campo.rotuloItem ?? 'item').toLowerCase()}`"
      icon="pi pi-plus"
      size="small"
      text
      @click="adicionar"
    />
  </div>
</template>

<style scoped>
.serie { display: flex; flex-direction: column; align-items: flex-start; gap: 0.25rem; width: 100%; }

.serie__tabela {
  width: 100%;
  border-collapse: collapse;
}
.serie__tabela th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  padding: 0 0.35rem 0.35rem;
}
.serie__tabela td { padding: 0.2rem 0.35rem; vertical-align: top; }
.serie__acoes { width: 44px; text-align: right; }
.serie__vazio { padding: 0.75rem 0.35rem; }

@media (max-width: 640px) {
  .serie__tabela, .serie__tabela tbody, .serie__tabela tr, .serie__tabela td { display: block; width: 100%; }
  .serie__tabela thead { display: none; }
  .serie__tabela tr {
    border: 1px solid var(--p-content-border-color);
    border-radius: var(--ob-radius);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
}
</style>

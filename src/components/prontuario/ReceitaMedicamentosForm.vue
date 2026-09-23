<script setup>
import { ref } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { OLHOS } from '@/utils/formato.js'

/** Receita de medicamentos e colírios (RFPRE02). */
const catalogos = useCatalogosStore()

const form = ref({
  itens: [{ medicamento: null, olho: 'AO', posologia: '', duracao: '' }],
  orientacoes: '',
})

/** Ao escolher o medicamento, sugere a posologia usual do catálogo. */
function aoEscolher(item, nome) {
  item.medicamento = nome
  const padrao = catalogos.medicamentos.find((m) => m.nome === nome)
  if (padrao && !item.posologia) item.posologia = padrao.posologia
}

const adicionar = () => form.value.itens.push({ medicamento: null, olho: 'AO', posologia: '', duracao: '' })
const remover = (i) => form.value.itens.splice(i, 1)

defineExpose({
  coletar: () => ({
    itens: form.value.itens.filter((i) => i.medicamento),
    orientacoes: form.value.orientacoes,
  }),
})
</script>

<template>
  <div class="ob-stack">
    <table class="itens">
      <thead>
        <tr>
          <th>Medicamento</th>
          <th>Olho</th>
          <th>Posologia</th>
          <th>Duração</th>
          <th />
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, i) in form.itens" :key="i">
          <td data-rotulo="Medicamento">
            <Select
              :model-value="item.medicamento"
              :options="catalogos.medicamentos"
              option-label="nome"
              option-value="nome"
              placeholder="Selecione"
              filter
              editable
              aria-label="Medicamento"
              fluid
              @update:model-value="(v) => aoEscolher(item, v)"
            />
          </td>
          <td data-rotulo="Olho">
            <Select v-model="item.olho" :options="OLHOS" option-label="value" option-value="value" aria-label="Olho" fluid />
          </td>
          <td data-rotulo="Posologia">
            <InputText v-model="item.posologia" placeholder="1 gota 12/12h" aria-label="Posologia" fluid />
          </td>
          <td data-rotulo="Duração">
            <InputText v-model="item.duracao" placeholder="30 dias" aria-label="Duração" fluid />
          </td>
          <td>
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              :disabled="form.itens.length === 1"
              aria-label="Remover medicamento"
              @click="remover(i)"
            />
          </td>
        </tr>
      </tbody>
    </table>

    <Button label="Adicionar medicamento" icon="pi pi-plus" size="small" text @click="adicionar" />

    <div class="campo">
      <label for="orientacoes">Orientações ao paciente</label>
      <Textarea id="orientacoes" v-model="form.orientacoes" rows="2" auto-resize fluid
        placeholder="Ex: aguardar 5 minutos entre a instilação de colírios diferentes" />
    </div>
  </div>
</template>

<style scoped>
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }

.itens { width: 100%; border-collapse: separate; border-spacing: 0.35rem; }
.itens th { font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); text-align: left; }
.itens td:last-child { width: 44px; }

@media (max-width: 760px) {
  .itens, .itens tbody, .itens tr, .itens td { display: block; width: 100%; }
  .itens thead { display: none; }
  .itens tr {
    border: 1px solid var(--p-content-border-color);
    border-radius: var(--ob-radius);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .itens td::before {
    content: attr(data-rotulo);
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--p-text-muted-color);
    margin-bottom: 0.15rem;
  }
}
</style>

<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Select from 'primevue/select'
import EmptyState from '@/components/common/EmptyState.vue'
import EyeBadge from '@/components/common/EyeBadge.vue'
import RegistroCard from '@/components/prontuario/RegistroCard.vue'
import ExameDialog from '@/components/exames/ExameDialog.vue'
import ExameVisualizacao from '@/components/exames/ExameVisualizacao.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { EXAME_REGISTRY, getExameSchema, resumirExame } from '@/mocks/exames/index.js'

const prontuario = useProntuarioStore()

const dialogo = ref(false)
const filtro = ref(null)
const emCorrecao = ref(null)

const vigentes = computed(() => prontuario.vigentes('exames'))

const opcoesFiltro = computed(() => {
  const tipos = new Set(vigentes.value.map((e) => e.tipo))
  return EXAME_REGISTRY.filter((s) => tipos.has(s.id))
})

const exames = computed(() =>
  vigentes.value.filter((e) => !filtro.value || e.tipo === filtro.value))

function novo() {
  emCorrecao.value = null
  dialogo.value = true
}

function corrigir(exame) {
  emCorrecao.value = exame
  dialogo.value = true
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <Select
        v-model="filtro"
        :options="opcoesFiltro"
        option-label="nome"
        option-value="id"
        placeholder="Todos os tipos de exame"
        show-clear
        class="barra__filtro"
      />
      <span class="ob-muted ob-small">{{ exames.length }} exame(s)</span>
      <span class="ob-spacer" />
      <Button label="Registrar exame" icon="pi pi-plus" @click="novo" />
    </div>

    <EmptyState
      v-if="!exames.length"
      icone="pi-eye"
      titulo="Nenhum exame registrado"
      descricao="Registre acuidade visual, tonometria, OCT e outros exames para compor o prontuário."
    >
      <Button label="Registrar exame" icon="pi pi-plus" class="vazio__acao" @click="novo" />
    </EmptyState>

    <RegistroCard
      v-for="e in exames"
      :key="e.id"
      :registro="e"
      :versoes="prontuario.versoes('exames', e)"
      :icone="getExameSchema(e.tipo)?.icone"
      @corrigir="corrigir"
    >
      <template #titulo>{{ getExameSchema(e.tipo)?.nome ?? e.tipo }}</template>
      <template #marcadores><EyeBadge :olho="e.olho" /></template>
      <template #resumo>{{ resumirExame(e) }}</template>

      <ExameVisualizacao :exame="e" />

      <template #versao="{ versao }">
        <p class="ob-small ob-muted versao__resumo">{{ resumirExame(versao) }}</p>
        <ExameVisualizacao :exame="versao" />
      </template>
    </RegistroCard>

    <ExameDialog v-model:visivel="dialogo" :registro="emCorrecao" />
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.barra__filtro { min-width: 240px; }
.vazio__acao { margin-top: 0.75rem; }
.versao__resumo { margin: 0 0 0.4rem; }
</style>

<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Card from 'primevue/card'
import Select from 'primevue/select'
import Panel from 'primevue/panel'
import { useConfirm } from 'primevue/useconfirm'
import EmptyState from '@/components/common/EmptyState.vue'
import EyeBadge from '@/components/common/EyeBadge.vue'
import ExameDialog from '@/components/exames/ExameDialog.vue'
import ExameVisualizacao from '@/components/exames/ExameVisualizacao.vue'
import SerieExameChart from '@/components/exames/SerieExameChart.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { EXAME_REGISTRY, getExameSchema, resumirExame } from '@/mocks/exames/index.js'
import { formatarData } from '@/utils/formato.js'

/** `consultaId` é informado quando a aba é usada dentro do fluxo de atendimento. */
const props = defineProps({ consultaId: { type: String, default: null } })

const prontuario = useProntuarioStore()
const confirm = useConfirm()

const dialogo = ref(false)
const filtro = ref(null)

const opcoesFiltro = computed(() => {
  const tipos = new Set(prontuario.exames.map((e) => e.tipo))
  return EXAME_REGISTRY.filter((s) => tipos.has(s.id))
})

const exames = computed(() =>
  prontuario.exames
    .filter((e) => !filtro.value || e.tipo === filtro.value)
    .sort((a, b) => new Date(b.data) - new Date(a.data)))

/**
 * Séries temporais disponíveis: qualquer schema que declare `grafico` e tenha
 * ao menos duas medições registradas. Nada aqui é específico de um exame.
 */
const series = computed(() =>
  EXAME_REGISTRY.filter((s) => s.grafico)
    .map((s) => {
      const registros = prontuario.serie(s.id)
      return {
        schema: s,
        pontos: registros.map((e) => ({ data: e.data, ...s.grafico.serie(e.dados ?? {}) })),
      }
    })
    .filter((s) => s.pontos.length >= 2))

function remover(exame) {
  confirm.require({
    header: 'Remover exame',
    message: `Remover ${getExameSchema(exame.tipo)?.nome} de ${formatarData(exame.data)}?`,
    acceptLabel: 'Remover',
    rejectLabel: 'Cancelar',
    acceptProps: { severity: 'danger' },
    accept: () => prontuario.removerExame(exame.id),
  })
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
      <Button label="Registrar exame" icon="pi pi-plus" @click="dialogo = true" />
    </div>

    <!-- Acompanhamento longitudinal: qualquer exame que declare série no schema -->
    <Panel v-if="series.length" header="Acompanhamento" toggleable>
      <div class="series">
        <SerieExameChart
          v-for="s in series"
          :key="s.schema.id"
          :pontos="s.pontos"
          :titulo="`${s.schema.grafico.titulo} — ${s.schema.nome}`"
          :unidade="s.schema.grafico.unidade"
        />
      </div>
    </Panel>

    <EmptyState
      v-if="!exames.length"
      icone="pi-eye"
      titulo="Nenhum exame registrado"
      descricao="Registre acuidade visual, tonometria, OCT e outros exames para compor o prontuário."
    >
      <Button label="Registrar exame" icon="pi pi-plus" class="vazio__acao" @click="dialogo = true" />
    </EmptyState>

    <Card v-for="e in exames" :key="e.id" class="exame">
      <template #title>
        <div class="exame__cab">
          <i class="pi" :class="getExameSchema(e.tipo)?.icone" />
          <span class="exame__nome">{{ getExameSchema(e.tipo)?.nome ?? e.tipo }}</span>
          <EyeBadge :olho="e.olho" />
          <span class="ob-spacer" />
          <span class="ob-small ob-muted">{{ formatarData(e.data) }}</span>
          <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Remover exame" @click="remover(e)" />
        </div>
      </template>
      <template #subtitle>
        <span class="ob-small ob-muted">{{ resumirExame(e) }}</span>
      </template>
      <template #content>
        <ExameVisualizacao :exame="e" />
      </template>
    </Card>

    <ExameDialog v-model:visivel="dialogo" :consulta-id="props.consultaId" />
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.barra__filtro { min-width: 240px; }

.series {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.25rem;
}

.exame__cab { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.exame__cab > .pi { color: var(--p-primary-500); }
.exame__nome { font-size: 1rem; }
.vazio__acao { margin-top: 0.75rem; }
</style>

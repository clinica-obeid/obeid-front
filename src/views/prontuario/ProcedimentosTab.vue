<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import EyeBadge from '@/components/common/EyeBadge.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { formatarData, OLHOS } from '@/utils/formato.js'

/**
 * Procedimentos terapêuticos (RFPRO01).
 * Entidade própria, separada do módulo de exames: o que se registra aqui é
 * uma intervenção realizada, não uma medida obtida.
 */
const props = defineProps({ consultaId: { type: String, default: null } })

const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const dialogo = ref(false)
const salvando = ref(false)
const form = ref(null)

const OPCOES_OLHO = OLHOS.map((o) => ({ label: o.value, value: o.value }))

function abrir() {
  form.value = {
    procedimentoId: null,
    olho: 'OD',
    data: new Date(),
    descricao: '',
    intercorrencias: '',
  }
  dialogo.value = true
}

const selecionado = computed(() =>
  catalogos.procedimentos.find((p) => p.id === form.value?.procedimentoId))

async function salvar() {
  if (!selecionado.value) return
  salvando.value = true
  try {
    await prontuario.salvarProcedimento({
      consultaId: props.consultaId,
      procedimentoId: selecionado.value.id,
      nome: selecionado.value.nome,
      categoria: selecionado.value.categoria,
      olho: form.value.olho,
      data: form.value.data.toISOString(),
      descricao: form.value.descricao,
      intercorrencias: form.value.intercorrencias,
      responsavelId: 'med-1',
    })
    dialogo.value = false
    toast.add({ severity: 'success', summary: 'Procedimento registrado', detail: selecionado.value.nome, life: 2500 })
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ prontuario.procedimentos.length }} procedimento(s)</span>
      <span class="ob-spacer" />
      <Button label="Registrar procedimento" icon="pi pi-plus" @click="abrir" />
    </div>

    <EmptyState
      v-if="!prontuario.procedimentos.length"
      icone="pi-bolt"
      titulo="Nenhum procedimento registrado"
      descricao="Laser, injeções intravítreas e demais intervenções terapêuticas aparecem aqui."
    />

    <Card v-for="p in prontuario.procedimentos" :key="p.id">
      <template #title>
        <div class="proc__cab">
          <i class="pi pi-bolt" />
          <span class="proc__nome">{{ p.nome }}</span>
          <EyeBadge :olho="p.olho" />
          <span class="ob-spacer" />
          <span class="ob-small ob-muted">{{ formatarData(p.data) }}</span>
        </div>
      </template>
      <template #subtitle>
        <span class="ob-small ob-muted">
          {{ p.categoria }} · {{ catalogos.medico(p.responsavelId)?.nome }}
        </span>
      </template>
      <template #content>
        <dl class="registro">
          <dt>Descrição</dt>
          <dd>{{ p.descricao || '—' }}</dd>
          <dt>Intercorrências</dt>
          <dd>{{ p.intercorrencias || 'Sem intercorrências' }}</dd>
        </dl>
      </template>
    </Card>

    <Dialog v-model:visible="dialogo" modal header="Registrar procedimento" :style="{ width: '620px' }">
      <div v-if="form" class="form">
        <div class="campo campo--full">
          <label for="proc-tipo">Procedimento</label>
          <Select
            id="proc-tipo"
            v-model="form.procedimentoId"
            :options="catalogos.procedimentos"
            option-label="nome"
            option-value="id"
            placeholder="Selecione o procedimento realizado"
            filter
            fluid
          >
            <template #option="{ option }">
              <span>{{ option.nome }} <small class="ob-muted">· {{ option.categoria }}</small></span>
            </template>
          </Select>
        </div>
        <div class="campo">
          <label>Olho</label>
          <SelectButton v-model="form.olho" :options="OPCOES_OLHO" option-label="label" option-value="value" :allow-empty="false" />
        </div>
        <div class="campo">
          <label for="proc-data">Data</label>
          <DatePicker id="proc-data" v-model="form.data" date-format="dd/mm/yy" show-icon fluid />
        </div>
        <div class="campo campo--full">
          <label for="proc-desc">Descrição técnica</label>
          <Textarea id="proc-desc" v-model="form.descricao" rows="3" auto-resize fluid
            placeholder="Ex: 360 graus, 100 disparos, energia média de 0,8 mJ" />
        </div>
        <div class="campo campo--full">
          <label for="proc-inter">Intercorrências</label>
          <Textarea id="proc-inter" v-model="form.intercorrencias" rows="2" auto-resize fluid
            placeholder="Deixe em branco se não houve intercorrências" />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button label="Salvar" icon="pi pi-check" :loading="salvando" :disabled="!selecionado" @click="salvar" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.proc__cab { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.proc__cab > .pi { color: var(--p-primary-500); }
.proc__nome { font-size: 1rem; }

.registro {
  display: grid;
  grid-template-columns: minmax(130px, max-content) 1fr;
  gap: 0.3rem 1rem;
  margin: 0;
  font-size: 0.875rem;
}
.registro dt { color: var(--p-text-muted-color); }
.registro dd { margin: 0; }

.form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem 1rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo label { font-size: 0.8125rem; font-weight: 600; }

@media (max-width: 640px) {
  .form { grid-template-columns: 1fr; }
  .registro { grid-template-columns: 1fr; }
}
</style>

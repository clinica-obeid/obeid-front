<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import EyeBadge from '@/components/common/EyeBadge.vue'
import RegistroCard from '@/components/prontuario/RegistroCard.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { OLHOS } from '@/utils/formato.js'

/**
 * Procedimentos terapêuticos (RFPRO01).
 * Entidade própria, separada do módulo de exames: o que se registra aqui é
 * uma intervenção realizada, não uma medida obtida.
 */
const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const dialogo = ref(false)
const salvando = ref(false)
const corrigindo = ref(null)
const form = ref(null)

const OPCOES_OLHO = OLHOS.map((o) => ({ label: o.value, value: o.value }))

const registros = computed(() => prontuario.vigentes('procedimentos'))

const selecionado = computed(() =>
  catalogos.procedimentos.find((p) => p.id === form.value?.procedimentoId))

function novo() {
  corrigindo.value = null
  form.value = {
    procedimentoId: null,
    olho: 'OD',
    data: new Date(),
    descricao: '',
    intercorrencias: '',
    motivo: '',
  }
  dialogo.value = true
}

function corrigir(registro) {
  corrigindo.value = registro
  form.value = {
    procedimentoId: registro.procedimentoId,
    olho: registro.olho,
    data: new Date(registro.data),
    descricao: registro.descricao ?? '',
    intercorrencias: registro.intercorrencias ?? '',
    motivo: '',
  }
  dialogo.value = true
}

async function salvar() {
  if (!selecionado.value) return
  salvando.value = true
  try {
    const payload = {
      procedimentoId: selecionado.value.id,
      nome: selecionado.value.nome,
      categoria: selecionado.value.categoria,
      olho: form.value.olho,
      descricao: form.value.descricao,
      intercorrencias: form.value.intercorrencias,
      responsavelId: 'med-1',
    }
    if (corrigindo.value) {
      await prontuario.corrigirProcedimento(corrigindo.value.id, { ...payload, motivoCorrecao: form.value.motivo })
      toast.add({ severity: 'success', summary: 'Procedimento corrigido', life: 2500 })
    } else {
      await prontuario.salvarProcedimento({ ...payload, data: form.value.data.toISOString() })
      toast.add({ severity: 'success', summary: 'Procedimento registrado', detail: selecionado.value.nome, life: 2500 })
    }
    dialogo.value = false
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ registros.length }} procedimento(s)</span>
      <span class="ob-spacer" />
      <Button label="Registrar procedimento" icon="pi pi-plus" @click="novo" />
    </div>

    <EmptyState
      v-if="!registros.length"
      icone="pi-bolt"
      titulo="Nenhum procedimento registrado"
      descricao="Laser, injeções intravítreas e demais intervenções terapêuticas aparecem aqui."
    />

    <RegistroCard
      v-for="p in registros"
      :key="p.id"
      :registro="p"
      :versoes="prontuario.versoes('procedimentos', p)"
      icone="pi-bolt"
      @corrigir="corrigir"
    >
      <template #titulo>{{ p.nome }}</template>
      <template #marcadores><EyeBadge :olho="p.olho" /></template>
      <template #resumo>{{ p.categoria }} · {{ catalogos.medico(p.responsavelId)?.nome }}</template>

      <dl class="leitura">
        <dt>Descrição</dt>
        <dd>{{ p.descricao || '—' }}</dd>
        <dt>Intercorrências</dt>
        <dd>{{ p.intercorrencias || 'Sem intercorrências' }}</dd>
      </dl>

      <template #versao="{ versao }">
        <dl class="leitura">
          <dt>Procedimento</dt>
          <dd>{{ versao.nome }} ({{ versao.olho }})</dd>
          <dt>Descrição</dt>
          <dd>{{ versao.descricao || '—' }}</dd>
          <dt>Intercorrências</dt>
          <dd>{{ versao.intercorrencias || 'Sem intercorrências' }}</dd>
        </dl>
      </template>
    </RegistroCard>

    <Dialog
      v-model:visible="dialogo"
      modal
      :header="corrigindo ? 'Corrigir procedimento' : 'Registrar procedimento'"
      :style="{ width: '620px' }"
      :breakpoints="{ '680px': '95vw' }"
    >
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
          <DatePicker id="proc-data" v-model="form.data" date-format="dd/mm/yy" show-icon :disabled="Boolean(corrigindo)" fluid />
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
        <div v-if="corrigindo" class="campo campo--full">
          <label for="proc-motivo">Motivo da correção</label>
          <InputText id="proc-motivo" v-model="form.motivo" placeholder="Ex: olho trocado no lançamento" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button
          :label="corrigindo ? 'Salvar correção' : 'Salvar'"
          icon="pi pi-check"
          :loading="salvando"
          :disabled="!selecionado"
          @click="salvar"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.leitura {
  display: grid;
  grid-template-columns: minmax(130px, max-content) 1fr;
  gap: 0.3rem 1rem;
  margin: 0;
  font-size: 0.875rem;
}
.leitura dt { color: var(--p-text-muted-color); }
.leitura dd { margin: 0; }

.form { display: grid; grid-template-columns: 1fr 1fr; gap: 0.85rem 1rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo label { font-size: 0.8125rem; font-weight: 600; }

@media (max-width: 640px) {
  .form { grid-template-columns: 1fr; }
  .leitura { grid-template-columns: 1fr; }
}
</style>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import SelectButton from 'primevue/selectbutton'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/common/PageHeader.vue'
import PacienteAvatar from '@/components/common/PacienteAvatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAgendaStore } from '@/stores/agenda.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { formatarHora, humanizarData, isoLocal } from '@/utils/formato.js'

const router = useRouter()
const toast = useToast()
const agenda = useAgendaStore()
const pacientes = usePacientesStore()
const catalogos = useCatalogosStore()

const visao = ref('quadro')
const VISOES = [
  { label: 'Quadro de fluxo', value: 'quadro', icon: 'pi pi-th-large' },
  { label: 'Lista', value: 'lista', icon: 'pi pi-list' },
]

const data = computed({
  get: () => new Date(`${agenda.data}T00:00:00`),
  set: (d) => {
    agenda.data = isoLocal(d)
    agenda.carregar()
  },
})

onMounted(async () => {
  await catalogos.carregar()
  await pacientes.buscar()
  await agenda.carregar()
})

function recarregar() {
  agenda.carregar()
}

const nomePaciente = (id) => pacientes.lista.find((p) => p.id === id)?.nome ?? '—'

/** Colunas do quadro: todo status do fluxo vira uma coluna (RFAGE02). */
const colunas = computed(() =>
  catalogos.statusFluxo.map((s) => ({ ...s, consultas: agenda.porStatus[s.id] ?? [] })))

const ordemStatus = computed(() => catalogos.statusFluxo.map((s) => s.id))

function proximoStatus(consulta) {
  const i = ordemStatus.value.indexOf(consulta.status)
  return ordemStatus.value[i + 1] ?? null
}

async function avancar(consulta) {
  const proximo = proximoStatus(consulta)
  if (!proximo) return
  await agenda.mudarStatus(consulta.id, proximo)
  toast.add({
    severity: 'success',
    summary: nomePaciente(consulta.pacienteId),
    detail: `Status alterado para "${catalogos.status(proximo).label}".`,
    life: 2500,
  })
}

async function definirStatus(consulta, status) {
  await agenda.mudarStatus(consulta.id, status)
}

// --------------------------------------------------------- agendamento (RFAGE01)
const dialogo = ref(false)
const nova = ref(null)
const salvando = ref(false)

function abrirAgendamento() {
  nova.value = {
    pacienteId: null,
    medicoId: catalogos.medicos[0]?.id,
    salaId: catalogos.salas[0]?.id,
    hora: new Date(new Date().setMinutes(0, 0, 0)),
    tipo: 'Retorno',
    motivo: '',
  }
  dialogo.value = true
}

async function agendar() {
  const f = nova.value
  if (!f.pacienteId) return
  salvando.value = true
  try {
    const dataHora = new Date(`${agenda.data}T00:00:00`)
    dataHora.setHours(f.hora.getHours(), f.hora.getMinutes(), 0, 0)
    await agenda.agendar({
      pacienteId: f.pacienteId,
      medicoId: f.medicoId,
      salaId: f.salaId,
      data: dataHora.toISOString(),
      tipo: f.tipo,
      motivo: f.motivo,
      status: 'agendado',
    })
    dialogo.value = false
    toast.add({ severity: 'success', summary: 'Consulta agendada', life: 2500 })
  } finally {
    salvando.value = false
  }
}

const TIPOS = ['Primeira consulta', 'Retorno', 'Exame', 'Procedimento', 'Urgência']
</script>

<template>
  <div>
    <PageHeader titulo="Agenda" icone="pi-calendar">
      <template #subtitulo>
        {{ agenda.consultas.length }} consulta(s) · {{ humanizarData(agenda.data) }}
      </template>
      <template #acoes>
        <Button label="Agendar consulta" icon="pi pi-plus" @click="abrirAgendamento" />
      </template>
    </PageHeader>

    <div class="filtros">
      <DatePicker v-model="data" date-format="dd/mm/yy" show-icon aria-label="Data da agenda" />
      <Select
        v-model="agenda.filtroMedico"
        :options="catalogos.medicos"
        option-label="nome"
        option-value="id"
        placeholder="Todos os médicos"
        show-clear
        class="filtros__campo"
        @change="recarregar"
      />
      <Select
        v-model="agenda.filtroSala"
        :options="catalogos.salas"
        option-label="nome"
        option-value="id"
        placeholder="Todas as salas"
        show-clear
        class="filtros__campo"
        @change="recarregar"
      />
      <span class="ob-spacer" />
      <SelectButton v-model="visao" :options="VISOES" option-label="label" option-value="value" :allow-empty="false" />
    </div>

    <EmptyState
      v-if="!agenda.carregando && !agenda.consultas.length"
      icone="pi-calendar-times"
      titulo="Nenhuma consulta nesta data"
      descricao="Ajuste os filtros ou agende uma nova consulta."
    />

    <!-- Quadro de fluxo do paciente (RFAGE02) -->
    <div v-else-if="visao === 'quadro'" class="quadro">
      <section v-for="coluna in colunas" :key="coluna.id" class="quadro__coluna">
        <header class="quadro__cab">
          <i class="pi" :class="coluna.icone" />
          <span>{{ coluna.label }}</span>
          <span class="quadro__contador">{{ coluna.consultas.length }}</span>
        </header>

        <p v-if="!coluna.consultas.length" class="quadro__vazio ob-small ob-muted">—</p>

        <article v-for="c in coluna.consultas" :key="c.id" class="cartao">
          <div class="cartao__topo">
            <PacienteAvatar :nome="nomePaciente(c.pacienteId)" tamanho="pequeno" />
            <span class="cartao__nome ob-truncate">{{ nomePaciente(c.pacienteId) }}</span>
            <span class="cartao__hora ob-mono ob-small">{{ formatarHora(c.data) }}</span>
          </div>
          <p class="cartao__motivo ob-small ob-muted">{{ c.motivo }}</p>
          <p class="cartao__meta ob-small ob-muted">
            {{ catalogos.medico(c.medicoId)?.nome }} · {{ catalogos.sala(c.salaId)?.nome }}
          </p>
          <div class="cartao__acoes">
            <Button
              v-if="proximoStatus(c)"
              :label="catalogos.status(proximoStatus(c)).label"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="small"
              outlined
              @click="avancar(c)"
            />
            <Button
              label="Atender"
              icon="pi pi-folder-open"
              size="small"
              text
              @click="router.push({ name: 'atendimento', params: { consultaId: c.id } })"
            />
          </div>
        </article>
      </section>
    </div>

    <!-- Lista -->
    <DataTable v-else :value="agenda.consultas" :loading="agenda.carregando" data-key="id" striped-rows>
      <Column header="Hora" style="width: 84px">
        <template #body="{ data: c }"><span class="ob-mono">{{ formatarHora(c.data) }}</span></template>
      </Column>
      <Column header="Paciente">
        <template #body="{ data: c }">
          <div class="ob-row">
            <PacienteAvatar :nome="nomePaciente(c.pacienteId)" tamanho="pequeno" />
            <span>{{ nomePaciente(c.pacienteId) }}</span>
          </div>
        </template>
      </Column>
      <Column header="Médico">
        <template #body="{ data: c }">{{ catalogos.medico(c.medicoId)?.nome }}</template>
      </Column>
      <Column header="Sala">
        <template #body="{ data: c }">{{ catalogos.sala(c.salaId)?.nome }}</template>
      </Column>
      <Column field="tipo" header="Tipo" />
      <Column field="motivo" header="Motivo" />
      <Column header="Status" style="width: 210px">
        <template #body="{ data: c }">
          <Select
            :model-value="c.status"
            :options="catalogos.statusFluxo"
            option-label="label"
            option-value="id"
            size="small"
            @update:model-value="(v) => definirStatus(c, v)"
          />
        </template>
      </Column>
      <Column style="width: 60px">
        <template #body="{ data: c }">
          <Button
            icon="pi pi-folder-open"
            text
            rounded
            aria-label="Abrir atendimento"
            @click="router.push({ name: 'atendimento', params: { consultaId: c.id } })"
          />
        </template>
      </Column>
    </DataTable>

    <!-- Agendamento (RFAGE01) -->
    <Dialog v-model:visible="dialogo" modal header="Agendar consulta" :style="{ width: '520px' }">
      <div v-if="nova" class="form">
        <div class="form__campo form__campo--full">
          <label for="ag-paciente">Paciente</label>
          <Select
            id="ag-paciente"
            v-model="nova.pacienteId"
            :options="pacientes.lista"
            option-label="nome"
            option-value="id"
            placeholder="Selecione o paciente"
            filter
            fluid
          />
        </div>
        <div class="form__campo">
          <label for="ag-hora">Horário</label>
          <DatePicker id="ag-hora" v-model="nova.hora" time-only show-icon icon-display="input" fluid />
        </div>
        <div class="form__campo">
          <label for="ag-tipo">Tipo</label>
          <Select id="ag-tipo" v-model="nova.tipo" :options="TIPOS" fluid />
        </div>
        <div class="form__campo">
          <label for="ag-medico">Médico</label>
          <Select id="ag-medico" v-model="nova.medicoId" :options="catalogos.medicos" option-label="nome" option-value="id" fluid />
        </div>
        <div class="form__campo">
          <label for="ag-sala">Sala</label>
          <Select id="ag-sala" v-model="nova.salaId" :options="catalogos.salas" option-label="nome" option-value="id" fluid />
        </div>
        <div class="form__campo form__campo--full">
          <label for="ag-motivo">Motivo</label>
          <InputText id="ag-motivo" v-model="nova.motivo" placeholder="Ex: controle de glaucoma" fluid />
        </div>
      </div>
      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button label="Agendar" icon="pi pi-check" :loading="salvando" :disabled="!nova?.pacienteId" @click="agendar" />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.filtros {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}
.filtros__campo { min-width: 190px; }

.quadro {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: minmax(230px, 1fr);
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.quadro__coluna {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.65rem;
  background: var(--ob-realce);
  border-radius: var(--ob-radius);
  min-height: 120px;
}

.quadro__cab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}
.quadro__contador {
  margin-left: auto;
  min-width: 20px;
  padding: 0 5px;
  text-align: center;
  border-radius: 999px;
  background: var(--ob-superficie);
  font-variant-numeric: tabular-nums;
}
.quadro__vazio { text-align: center; padding: 0.5rem 0; }

.cartao {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  padding: 0.6rem;
  background: var(--ob-superficie);
  border: 1px solid var(--p-content-border-color);
  border-radius: 8px;
}
.cartao__topo { display: flex; align-items: center; gap: 0.4rem; }
.cartao__nome { flex: 1; min-width: 0; font-weight: 600; font-size: 0.8125rem; }
.cartao__hora { flex-shrink: 0; }
.cartao__motivo, .cartao__meta { margin: 0; }
.cartao__acoes { display: flex; gap: 0.25rem; flex-wrap: wrap; margin-top: 0.25rem; }

.form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}
.form__campo { display: flex; flex-direction: column; gap: 0.3rem; }
.form__campo--full { grid-column: 1 / -1; }
.form__campo label { font-size: 0.8125rem; font-weight: 600; }

@media (max-width: 640px) {
  .form { grid-template-columns: 1fr; }
}
</style>

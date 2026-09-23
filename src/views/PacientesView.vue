<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Tag from 'primevue/tag'
import PageHeader from '@/components/common/PageHeader.vue'
import PacienteAvatar from '@/components/common/PacienteAvatar.vue'
import DataMaskedText from '@/components/common/DataMaskedText.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { usePacientesStore } from '@/stores/pacientes.js'
import { idade } from '@/utils/formato.js'

const router = useRouter()
const pacientes = usePacientesStore()
const busca = ref('')
let debounce

onMounted(() => pacientes.buscar())

watch(busca, (valor) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => pacientes.buscar({ busca: valor }), 300)
})

const abrir = (paciente) =>
  router.push({ name: 'prontuario-timeline', params: { id: paciente.id } })
</script>

<template>
  <div>
    <PageHeader titulo="Pacientes" icone="pi-users" :subtitulo="`${pacientes.total} paciente(s) cadastrado(s)`">
      <template #acoes>
        <Button label="Novo paciente" icon="pi pi-user-plus" @click="router.push({ name: 'paciente-novo' })" />
      </template>
    </PageHeader>

    <IconField class="busca">
      <InputIcon class="pi pi-search" />
      <InputText v-model="busca" placeholder="Buscar por nome, CPF ou telefone" fluid />
    </IconField>

    <DataTable
      :value="pacientes.lista"
      :loading="pacientes.carregando"
      data-key="id"
      striped-rows
      paginator
      :rows="10"
      :rows-per-page-options="[10, 25, 50]"
      row-hover
      class="tabela"
      @row-click="({ data }) => abrir(data)"
    >
      <template #empty>
        <EmptyState
          icone="pi-user"
          titulo="Nenhum paciente encontrado"
          descricao="Revise o termo buscado ou cadastre um novo paciente."
        />
      </template>

      <Column header="Paciente">
        <template #body="{ data: p }">
          <div class="ob-row">
            <PacienteAvatar :nome="p.nome" />
            <div>
              <div class="tabela__nome">{{ p.nome }}</div>
              <small class="ob-muted">{{ idade(p.dataNascimento) }} anos · {{ p.sexo }}</small>
            </div>
          </div>
        </template>
      </Column>

      <Column header="CPF" style="width: 170px">
        <template #body="{ data: p }"><DataMaskedText :valor="p.cpf" tipo="cpf" /></template>
      </Column>

      <Column header="Contato" style="width: 180px">
        <template #body="{ data: p }"><DataMaskedText :valor="p.contato.celular" tipo="telefone" /></template>
      </Column>

      <Column header="Convênio" style="width: 170px">
        <template #body="{ data: p }">{{ p.convenio.nome }}</template>
      </Column>

      <Column header="Condições">
        <template #body="{ data: p }">
          <div class="ob-row-wrap">
            <Tag
              v-for="d in p.historico.doencasOculares"
              :key="d"
              :value="d"
              severity="secondary"
              class="tabela__tag"
            />
            <Tag
              v-for="a in p.alergias"
              :key="a.substancia"
              :value="`Alergia: ${a.substancia}`"
              severity="danger"
              icon="pi pi-exclamation-triangle"
              class="tabela__tag"
            />
            <span v-if="!p.historico.doencasOculares.length && !p.alergias.length" class="ob-muted ob-small">—</span>
          </div>
        </template>
      </Column>

      <Column style="width: 56px">
        <template #body><i class="pi pi-chevron-right ob-muted" /></template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.busca { width: min(420px, 100%); margin-bottom: 1rem; display: block; }
.tabela :deep(tbody tr) { cursor: pointer; }
.tabela__nome { font-weight: 500; }
.tabela__tag { font-size: 0.7rem; }
</style>

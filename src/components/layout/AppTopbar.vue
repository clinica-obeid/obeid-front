<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AutoComplete from 'primevue/autocomplete'
import Button from 'primevue/button'
import Menu from 'primevue/menu'
import { useConfirm } from 'primevue/useconfirm'
import { api } from '@/services/api.js'
import { restaurar } from '@/mocks/db.js'
import { idade, mascarar } from '@/utils/formato.js'

defineEmits(['abrir-menu'])

const router = useRouter()
const confirm = useConfirm()

const busca = ref(null)
const sugestoes = ref([])
const campoBusca = ref(null)
const menu = ref(null)
const escuro = ref(false)

/** Busca global de pacientes — atalho "/" (RNFUSA02). */
async function procurar({ query }) {
  sugestoes.value = await api.pacientes.list({ busca: query })
}

function abrirPaciente(evento) {
  const paciente = evento.value
  busca.value = null
  router.push({ name: 'prontuario-timeline', params: { id: paciente.id } })
}

function atalho(e) {
  const digitando = ['INPUT', 'TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable
  if (e.key === '/' && !digitando) {
    e.preventDefault()
    campoBusca.value?.$el?.querySelector('input')?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', atalho))
onUnmounted(() => window.removeEventListener('keydown', atalho))

function alternarTema() {
  escuro.value = !escuro.value
  document.documentElement.classList.toggle('ob-dark', escuro.value)
}

function restaurarDados() {
  confirm.require({
    header: 'Restaurar dados de demonstração',
    message: 'Todas as alterações feitas durante a demonstração serão descartadas e os dados originais voltarão. Deseja continuar?',
    acceptLabel: 'Restaurar',
    rejectLabel: 'Cancelar',
    acceptProps: { severity: 'danger' },
    accept: () => {
      restaurar()
      window.location.reload()
    },
  })
}

const itensMenu = [
  { label: 'Restaurar dados de demonstração', icon: 'pi pi-refresh', command: restaurarDados },
  { separator: true },
  { label: 'Dra. Helena Marques', icon: 'pi pi-user', disabled: true },
  { label: 'CRM-SP 118.402', disabled: true },
]
</script>

<template>
  <header class="topo">
    <Button
      class="topo__menu"
      icon="pi pi-bars"
      text
      rounded
      aria-label="Abrir menu"
      @click="$emit('abrir-menu')"
    />

    <AutoComplete
      ref="campoBusca"
      v-model="busca"
      :suggestions="sugestoes"
      option-label="nome"
      placeholder="Buscar paciente por nome, CPF ou telefone…"
      class="topo__busca"
      :delay="250"
      complete-on-focus
      @complete="procurar"
      @option-select="abrirPaciente"
    >
      <template #option="{ option }">
        <div class="ob-row" style="gap: 0.75rem">
          <span class="topo__avatar">{{ option.nome.charAt(0) }}</span>
          <div>
            <div>{{ option.nome }}</div>
            <small class="ob-muted">
              {{ idade(option.dataNascimento) }} anos · CPF {{ mascarar(option.cpf) }} · {{ option.convenio.nome }}
            </small>
          </div>
        </div>
      </template>
      <template #empty>
        <span class="ob-muted">Nenhum paciente encontrado.</span>
      </template>
    </AutoComplete>

    <kbd class="topo__atalho">/</kbd>

    <span class="ob-spacer" />

    <Button
      :icon="escuro ? 'pi pi-sun' : 'pi pi-moon'"
      text
      rounded
      :aria-label="escuro ? 'Tema claro' : 'Tema escuro'"
      @click="alternarTema"
    />
    <Button icon="pi pi-cog" text rounded aria-label="Configurações" @click="menu.toggle($event)" />
    <Menu ref="menu" :model="itensMenu" popup />
  </header>
</template>

<style scoped>
.topo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  height: var(--ob-header-h);
  padding: 0 0.75rem;
  border-bottom: 1px solid var(--p-content-border-color);
  background: var(--ob-superficie);
}

.topo__menu { display: none; }

.topo__busca { width: min(420px, 45vw); }
.topo__busca :deep(input) { width: 100%; }

.topo__avatar {
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
  font-weight: 600;
}

.topo__atalho {
  padding: 1px 6px;
  border: 1px solid var(--p-content-border-color);
  border-bottom-width: 2px;
  border-radius: 5px;
  font-size: 0.7rem;
  color: var(--p-text-muted-color);
}

@media (max-width: 1023px) {
  .topo__menu { display: inline-flex; }
  .topo__atalho { display: none; }
  .topo__busca { width: 100%; }
}
</style>

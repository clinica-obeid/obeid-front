<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import Card from 'primevue/card'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import PageHeader from '@/components/common/PageHeader.vue'
import PacienteAvatar from '@/components/common/PacienteAvatar.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import EmptyState from '@/components/common/EmptyState.vue'
import { useAgendaStore } from '@/stores/agenda.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { formatarExtenso, formatarHora } from '@/utils/formato.js'

const router = useRouter()
const agenda = useAgendaStore()
const pacientes = usePacientesStore()
const catalogos = useCatalogosStore()

onMounted(async () => {
  await catalogos.carregar()
  await pacientes.buscar()
  await agenda.carregar()
})

const nomePaciente = (id) => pacientes.lista.find((p) => p.id === id)?.nome ?? 'Paciente'

const contadores = computed(() => [
  { rotulo: 'Consultas hoje', valor: agenda.consultas.length, icone: 'pi-calendar', cor: 'primaria' },
  { rotulo: 'Em atendimento', valor: agenda.emAndamento.length, icone: 'pi-spinner', cor: 'ativa' },
  { rotulo: 'Aguardando triagem', valor: agenda.porStatus['aguardando-triagem']?.length ?? 0, icone: 'pi-clock', cor: 'espera' },
  { rotulo: 'Finalizadas', valor: agenda.porStatus.finalizado?.length ?? 0, icone: 'pi-check-circle', cor: 'ok' },
  { rotulo: 'Pacientes cadastrados', valor: pacientes.total, icone: 'pi-users', cor: 'neutra' },
])

const proximas = computed(() =>
  agenda.consultas.filter((c) => c.status !== 'finalizado').slice(0, 6))

function abrirAtendimento(consulta) {
  router.push({ name: 'atendimento', params: { consultaId: consulta.id } })
}
</script>

<template>
  <div>
    <PageHeader titulo="Painel do dia" icone="pi-home">
      <template #subtitulo>{{ formatarExtenso(new Date().toISOString()) }}</template>
      <template #acoes>
        <Button label="Abrir agenda" icon="pi pi-calendar" outlined @click="router.push({ name: 'agenda' })" />
        <Button label="Novo paciente" icon="pi pi-user-plus" @click="router.push({ name: 'paciente-novo' })" />
      </template>
    </PageHeader>

    <div class="indicadores">
      <article v-for="c in contadores" :key="c.rotulo" class="indicador" :class="`indicador--${c.cor}`">
        <i class="pi" :class="c.icone" />
        <strong class="indicador__valor">{{ c.valor }}</strong>
        <span class="indicador__rotulo">{{ c.rotulo }}</span>
      </article>
    </div>

    <div class="painel">
      <Card class="painel__col">
        <template #title>
          <span class="ob-row">
            <i class="pi pi-list-check" /> Fila de atendimento
            <span class="ob-spacer" />
            <Button label="Ver agenda" size="small" text @click="router.push({ name: 'agenda' })" />
          </span>
        </template>
        <template #content>
          <div v-if="agenda.carregando" class="carregando"><ProgressSpinner style="width: 34px" /></div>

          <EmptyState
            v-else-if="!proximas.length"
            icone="pi-check-circle"
            titulo="Nenhum paciente na fila"
            descricao="Todas as consultas de hoje foram finalizadas."
          />

          <ul v-else class="fila">
            <li v-for="c in proximas" :key="c.id" class="fila__item">
              <PacienteAvatar :nome="nomePaciente(c.pacienteId)" />
              <div class="fila__info">
                <span class="fila__nome">{{ nomePaciente(c.pacienteId) }}</span>
                <small class="ob-muted">
                  {{ formatarHora(c.data) }} · {{ catalogos.medico(c.medicoId)?.nome }} · {{ c.motivo }}
                </small>
              </div>
              <StatusTag :status="c.status" />
              <Button
                icon="pi pi-arrow-right"
                text
                rounded
                aria-label="Abrir atendimento"
                @click="abrirAtendimento(c)"
              />
            </li>
          </ul>
        </template>
      </Card>

      <Card class="painel__col">
        <template #title><span class="ob-row"><i class="pi pi-users" /> Pacientes recentes</span></template>
        <template #content>
          <ul class="fila">
            <li
              v-for="p in pacientes.lista.slice(0, 6)"
              :key="p.id"
              class="fila__item fila__item--clicavel"
              @click="router.push({ name: 'prontuario-timeline', params: { id: p.id } })"
            >
              <PacienteAvatar :nome="p.nome" />
              <div class="fila__info">
                <span class="fila__nome">{{ p.nome }}</span>
                <small class="ob-muted">
                  {{ p.convenio.nome }}
                  <template v-if="p.historico.doencasOculares.length">
                    · {{ p.historico.doencasOculares.join(', ') }}
                  </template>
                </small>
              </div>
              <i class="pi pi-chevron-right ob-muted" />
            </li>
          </ul>
        </template>
      </Card>
    </div>
  </div>
</template>

<style scoped>
.indicadores {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.indicador {
  display: grid;
  grid-template-columns: auto 1fr;
  grid-template-rows: auto auto;
  align-items: center;
  gap: 0 0.6rem;
  padding: 0.85rem 1rem;
  border: 1px solid var(--p-content-border-color);
  border-left: 3px solid var(--p-primary-500);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
}
.indicador .pi { grid-row: 1 / 3; font-size: 1.1rem; color: var(--p-primary-600); }
.indicador__valor { font-size: 1.5rem; line-height: 1.1; font-variant-numeric: tabular-nums; }
.indicador__rotulo { font-size: 0.75rem; color: var(--p-text-muted-color); }
.indicador--ativa { border-left-color: var(--p-blue-500); }
.indicador--ativa .pi { color: var(--p-blue-500); }
.indicador--espera { border-left-color: var(--p-amber-500); }
.indicador--espera .pi { color: var(--p-amber-600); }
.indicador--ok { border-left-color: var(--p-green-500); }
.indicador--ok .pi { color: var(--p-green-600); }
.indicador--neutra { border-left-color: var(--ob-marcador); }
.indicador--neutra .pi { color: var(--p-text-muted-color); }

.painel { display: grid; grid-template-columns: 1.4fr 1fr; gap: var(--ob-gap); align-items: start; }
@media (max-width: 1100px) { .painel { grid-template-columns: 1fr; } }

.fila { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.fila__item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.55rem 0.25rem;
  border-bottom: 1px solid var(--p-content-border-color);
}
.fila__item:last-child { border-bottom: 0; }
.fila__item--clicavel { cursor: pointer; border-radius: 6px; }
.fila__item--clicavel:hover { background: var(--ob-fundo); }
.fila__info { flex: 1; min-width: 0; display: flex; flex-direction: column; }
.fila__nome { font-weight: 500; }
.fila__info small { font-size: 0.75rem; }

.carregando { display: grid; place-items: center; padding: 2rem; }
</style>

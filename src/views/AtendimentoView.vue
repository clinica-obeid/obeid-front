<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import { useToast } from 'primevue/usetoast'
import PacienteAvatar from '@/components/common/PacienteAvatar.vue'
import ExameDialog from '@/components/exames/ExameDialog.vue'
import AnamneseTab from '@/views/prontuario/AnamneseTab.vue'
import ExamesTab from '@/views/prontuario/ExamesTab.vue'
import DiagnosticosTab from '@/views/prontuario/DiagnosticosTab.vue'
import PrescricoesTab from '@/views/prontuario/PrescricoesTab.vue'
import { api } from '@/services/api.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { exameDestaques } from '@/mocks/exames/index.js'
import { formatarHora, idade } from '@/utils/formato.js'

/**
 * Atendimento em curso (RNFUSA02).
 *
 * Reúne os módulos do prontuário numa sequência de passos e mantém o
 * contexto da consulta, para que tudo o que for registrado fique vinculado
 * a ela sem exigir que o médico navegue entre telas.
 */
const props = defineProps({ consultaId: { type: String, required: true } })

const router = useRouter()
const toast = useToast()
const pacientes = usePacientesStore()
const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()

const consulta = ref(null)
const carregando = ref(true)
const passo = ref(0)
const dialogoExame = ref(false)
const tipoExameRapido = ref(null)

const PASSOS = [
  { rotulo: 'Anamnese', icone: 'pi-comment', componente: AnamneseTab },
  { rotulo: 'Exames', icone: 'pi-eye', componente: ExamesTab },
  { rotulo: 'Diagnóstico', icone: 'pi-tag', componente: DiagnosticosTab },
  { rotulo: 'Prescrição', icone: 'pi-file-edit', componente: PrescricoesTab },
]

const destaques = exameDestaques()

const paciente = computed(() => pacientes.atual)

onMounted(async () => {
  await catalogos.carregar()
  consulta.value = await api.consultas.get(props.consultaId)
  if (consulta.value) {
    await pacientes.carregar(consulta.value.pacienteId)
    await prontuario.carregar(consulta.value.pacienteId, { forcar: true })
  }
  carregando.value = false
})

function exameRapido(tipo) {
  tipoExameRapido.value = tipo
  dialogoExame.value = true
}

/** Registros já lançados nesta consulta — o "progresso" do atendimento. */
const registrosDaConsulta = computed(() => {
  const g = prontuario.timeline.find((t) => t.consulta.id === props.consultaId)
  return {
    anamnese: Boolean(g?.anamnese),
    exames: g?.exames.length ?? 0,
    diagnosticos: g?.diagnosticos.length ?? 0,
    prescricoes: g?.prescricoes.length ?? 0,
  }
})

const concluido = (i) => [
  registrosDaConsulta.value.anamnese,
  registrosDaConsulta.value.exames > 0,
  registrosDaConsulta.value.diagnosticos > 0,
  registrosDaConsulta.value.prescricoes > 0,
][i]

async function finalizar() {
  const encerrada = await prontuario.encerrarConsulta(props.consultaId)
  consulta.value = encerrada ?? consulta.value
  toast.add({ severity: 'success', summary: 'Atendimento finalizado', life: 3000 })
  router.push({ name: 'prontuario-timeline', params: { id: consulta.value.pacienteId } })
}
</script>

<template>
  <div v-if="carregando" class="carregando"><ProgressSpinner style="width: 40px" /></div>

  <Message v-else-if="!consulta" severity="error" :closable="false">
    Consulta não encontrada.
  </Message>

  <div v-else class="atendimento">
    <!-- Contexto permanente da consulta -->
    <header class="contexto">
      <PacienteAvatar :nome="paciente?.nome" tamanho="grande" />
      <div class="contexto__info">
        <h1 class="contexto__nome">{{ paciente?.nome }}</h1>
        <p class="ob-small ob-muted contexto__meta">
          {{ idade(paciente?.dataNascimento) }} anos · {{ paciente?.convenio.nome }} ·
          {{ consulta.tipo }} às {{ formatarHora(consulta.data) }} ·
          {{ catalogos.medico(consulta.medicoId)?.nome }}
        </p>
        <p class="contexto__motivo">{{ consulta.motivo }}</p>
      </div>
      <div class="contexto__acoes">
        <Tag
          v-if="consulta.encerradaEm"
          value="Atendimento encerrado"
          severity="success"
          icon="pi pi-check-circle"
        />
        <Button
          label="Prontuário completo"
          icon="pi pi-folder-open"
          outlined
          @click="router.push({ name: 'prontuario-timeline', params: { id: paciente.id } })"
        />
        <Button
          v-if="!consulta.encerradaEm"
          label="Finalizar atendimento"
          icon="pi pi-check-circle"
          severity="success"
          @click="finalizar"
        />
      </div>
    </header>

    <Message v-if="paciente?.alergias.length" severity="error" :closable="false" class="alergias">
      <strong>Alergias:</strong>&nbsp;
      {{ paciente.alergias.map((a) => `${a.substancia} (${a.gravidade.toLowerCase()})`).join(' · ') }}
    </Message>

    <!-- Atalhos para os exames mais frequentes na consulta -->
    <div class="atalhos">
      <span class="ob-small ob-muted">Registro rápido:</span>
      <Button
        v-for="d in destaques"
        :key="d.id"
        :label="d.abrev"
        :icon="`pi ${d.icone}`"
        size="small"
        outlined
        v-tooltip.bottom="d.nome"
        @click="exameRapido(d.id)"
      />
      <Button label="Outro exame" icon="pi pi-plus" size="small" text @click="exameRapido(null)" />
    </div>

    <!-- Passos do atendimento -->
    <nav class="passos">
      <button
        v-for="(p, i) in PASSOS"
        :key="p.rotulo"
        type="button"
        class="passos__item"
        :class="{ 'passos__item--ativo': passo === i, 'passos__item--ok': concluido(i) }"
        @click="passo = i"
      >
        <span class="passos__numero">
          <i v-if="concluido(i)" class="pi pi-check" />
          <template v-else>{{ i + 1 }}</template>
        </span>
        <span>{{ p.rotulo }}</span>
      </button>
    </nav>

    <section class="conteudo">
      <component :is="PASSOS[passo].componente" :consulta-id="consultaId" />
    </section>

    <footer class="navegacao">
      <Button label="Anterior" icon="pi pi-arrow-left" text :disabled="passo === 0" @click="passo--" />
      <span class="ob-spacer" />
      <div class="ob-row-wrap ob-small ob-muted">
        <Tag v-if="registrosDaConsulta.anamnese" value="Anamnese" severity="success" icon="pi pi-check" />
        <Tag v-if="registrosDaConsulta.exames" :value="`${registrosDaConsulta.exames} exame(s)`" severity="success" icon="pi pi-check" />
        <Tag v-if="registrosDaConsulta.diagnosticos" value="Diagnóstico" severity="success" icon="pi pi-check" />
        <Tag v-if="registrosDaConsulta.prescricoes" :value="`${registrosDaConsulta.prescricoes} prescrição(ões)`" severity="success" icon="pi pi-check" />
      </div>
      <span class="ob-spacer" />
      <Button
        v-if="passo < PASSOS.length - 1"
        label="Próximo"
        icon="pi pi-arrow-right"
        icon-pos="right"
        @click="passo++"
      />
      <Button
        v-else-if="!consulta.encerradaEm"
        label="Finalizar atendimento"
        icon="pi pi-check-circle"
        severity="success"
        @click="finalizar"
      />
    </footer>

    <ExameDialog
      v-model:visivel="dialogoExame"
      :tipo-inicial="tipoExameRapido"
      :consulta-id="consultaId"
    />
  </div>
</template>

<style scoped>
.carregando { display: grid; place-items: center; padding: 4rem; }
.atendimento { display: flex; flex-direction: column; gap: 1rem; }

.contexto {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
}
.contexto__info { flex: 1; min-width: 240px; }
.contexto__nome { font-size: 1.25rem; }
.contexto__meta { margin: 0.2rem 0 0; }
.contexto__motivo { margin: 0.4rem 0 0; font-size: 0.9375rem; font-weight: 500; }
.contexto__acoes { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.alergias { margin: 0; }

.atalhos {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  flex-wrap: wrap;
  padding: 0.6rem 0.85rem;
  border-radius: var(--ob-radius);
  background: var(--ob-realce);
}

.passos { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.passos__item {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 40px;
  padding: 0 0.9rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: 999px;
  background: var(--ob-superficie);
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}
.passos__item:hover { border-color: var(--p-primary-300); }
.passos__item--ativo {
  border-color: var(--p-primary-500);
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
}
.passos__numero {
  display: grid;
  place-items: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--ob-realce);
  font-size: 0.7rem;
  font-weight: 700;
}
.passos__item--ok .passos__numero { background: var(--p-green-500); color: #fff; }

.conteudo {
  padding: 1rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
}

.navegacao { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.navegacao :deep(.p-tag) { font-size: 0.7rem; }
</style>

<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import RegistroCard from '@/components/prontuario/RegistroCard.vue'
import ReceitaOculosForm from '@/components/prontuario/ReceitaOculosForm.vue'
import ReceitaMedicamentosForm from '@/components/prontuario/ReceitaMedicamentosForm.vue'
import AtestadoForm from '@/components/prontuario/AtestadoForm.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { usePacientesStore } from '@/stores/pacientes.js'
import { formatarGrau } from '@/utils/formato.js'

/** Prescrições: óculos (RFPRE01), medicamentos (RFPRE02) e atestados (RFPRE03). */
const prontuario = useProntuarioStore()
const pacientes = usePacientesStore()
const toast = useToast()

const TIPOS = {
  oculos: { rotulo: 'Receita de óculos', icone: 'pi-eye', componente: ReceitaOculosForm },
  medicamentos: { rotulo: 'Receita de medicamentos', icone: 'pi-pills', componente: ReceitaMedicamentosForm },
  atestado: { rotulo: 'Atestado', icone: 'pi-file', componente: AtestadoForm },
}

const dialogo = ref(false)
const tipo = ref(null)
const corrigindo = ref(null)
const motivo = ref('')
const salvando = ref(false)
const formulario = ref(null)

const registros = computed(() => prontuario.vigentes('prescricoes'))

/** Última refração em vigor — pré-preenche a receita de óculos (RNFUSA02). */
const ultimaRefracao = computed(() => prontuario.ultimoExame('refracao'))
const alergias = computed(() => pacientes.atual?.alergias ?? [])

function abrir(qual) {
  corrigindo.value = null
  motivo.value = ''
  tipo.value = qual
  dialogo.value = true
}

function corrigir(registro) {
  corrigindo.value = registro
  motivo.value = ''
  tipo.value = registro.tipo
  dialogo.value = true
}

async function salvar() {
  const dados = formulario.value?.coletar()
  if (!dados) return
  salvando.value = true
  try {
    if (corrigindo.value) {
      await prontuario.corrigirPrescricao(corrigindo.value.id, { dados, motivoCorrecao: motivo.value })
      toast.add({ severity: 'success', summary: `${TIPOS[tipo.value].rotulo} corrigida`, life: 2500 })
    } else {
      await prontuario.salvarPrescricao({ tipo: tipo.value, dados, responsavelId: 'med-1' })
      toast.add({ severity: 'success', summary: `${TIPOS[tipo.value].rotulo} emitida`, life: 2500 })
    }
    dialogo.value = false
  } finally {
    salvando.value = false
  }
}

/** Resumo de uma linha para o cartão da listagem. */
function resumo(p) {
  if (p.tipo === 'oculos') {
    const olho = (o) => (o?.esfera == null ? '—' : `${formatarGrau(o.esfera)} ${formatarGrau(o.cilindro ?? 0)} × ${o.eixo ?? 0}°`)
    return `OD ${olho(p.dados.od)} · OE ${olho(p.dados.oe)}`
  }
  if (p.tipo === 'medicamentos') return p.dados.itens.map((i) => i.medicamento).join(' · ')
  return `${p.dados.dias} dia(s) de afastamento`
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ registros.length }} documento(s) emitido(s)</span>
      <span class="ob-spacer" />
      <Button
        v-for="(t, chave) in TIPOS"
        :key="chave"
        :label="t.rotulo"
        :icon="`pi ${t.icone}`"
        outlined
        @click="abrir(chave)"
      />
    </div>

    <EmptyState
      v-if="!registros.length"
      icone="pi-file-edit"
      titulo="Nenhum documento emitido"
      descricao="Receitas de óculos, de medicamentos e atestados ficam registrados aqui."
    />

    <RegistroCard
      v-for="p in registros"
      :key="p.id"
      :registro="p"
      :versoes="prontuario.versoes('prescricoes', p)"
      :icone="TIPOS[p.tipo].icone"
      @corrigir="corrigir"
    >
      <template #titulo>{{ TIPOS[p.tipo].rotulo }}</template>
      <template #marcadores>
        <!--
          O botão é o próprio link. Envolvê-lo num RouterLink produziria um
          <button> dentro de <a> — HTML inválido, e o Chrome não segue o link
          quando o clique nasce no botão.
        -->
        <Button
          as="router-link"
          :to="{ name: 'impressao', params: { prescricaoId: p.id } }"
          target="_blank"
          label="Imprimir"
          icon="pi pi-print"
          size="small"
          text
        />
      </template>

      <p class="doc__resumo">{{ resumo(p) }}</p>

      <div v-if="p.tipo === 'medicamentos'" class="doc__itens">
        <div v-for="(item, i) in p.dados.itens" :key="i" class="doc__item">
          <Tag :value="item.olho" severity="secondary" />
          <span><strong>{{ item.medicamento }}</strong> — {{ item.posologia }} ({{ item.duracao }})</span>
        </div>
      </div>

      <p v-if="p.dados.orientacoes" class="ob-small ob-muted doc__obs">{{ p.dados.orientacoes }}</p>
      <p v-if="p.dados.observacoes" class="ob-small ob-muted doc__obs">{{ p.dados.observacoes }}</p>

      <template #versao="{ versao }">
        <p class="doc__resumo">{{ resumo(versao) }}</p>
      </template>
    </RegistroCard>

    <Dialog
      v-model:visible="dialogo"
      modal
      :header="tipo ? `${corrigindo ? 'Corrigir' : ''} ${TIPOS[tipo].rotulo}`.trim() : ''"
      :style="{ width: '760px' }"
      :breakpoints="{ '840px': '95vw' }"
    >
      <Message v-if="tipo === 'medicamentos' && alergias.length" severity="error" :closable="false" class="alerta">
        <strong>Atenção — alergias registradas:</strong>
        {{ alergias.map((a) => a.substancia).join(', ') }}
      </Message>

      <component
        :is="TIPOS[tipo].componente"
        v-if="tipo"
        ref="formulario"
        :ultima-refracao="ultimaRefracao"
        :valor-inicial="corrigindo?.dados ?? null"
      />

      <div v-if="corrigindo" class="campo">
        <label for="pre-motivo">Motivo da correção</label>
        <InputText id="pre-motivo" v-model="motivo" placeholder="Ex: grau digitado no olho trocado" fluid />
      </div>

      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button
          :label="corrigindo ? 'Salvar correção' : 'Emitir documento'"
          icon="pi pi-check"
          :loading="salvando"
          @click="salvar"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.doc__resumo { margin: 0; font-size: 0.875rem; font-variant-numeric: tabular-nums; }
.doc__itens { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem; }
.doc__item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; }
.doc__obs { margin: 0.5rem 0 0; }

.alerta { margin-bottom: 0.75rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.85rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
</style>

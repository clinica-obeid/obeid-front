<script setup>
import { computed, ref } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import RegistroCard from '@/components/prontuario/RegistroCard.vue'
import CampoInput from '@/components/exames/CampoInput.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { clonarDados } from '@/utils/formato.js'
import {
  ANAMNESE_CAMPOS, getAnamneseCampo, somenteAnamnesePreenchidos,
} from '@/mocks/anamnese-campos.js'

/**
 * Anamnese oftalmológica (RFANA01–02).
 *
 * O formulário mostra o catálogo inteiro de perguntas; na gravação só entram
 * as respondidas. O registro guarda quais foram, e é isso que a leitura
 * mostra — nem toda consulta responde a anamnese inteira.
 */
const prontuario = useProntuarioStore()
const toast = useToast()

const dialogo = ref(false)
const corrigindo = ref(null)
const salvando = ref(false)
const dados = ref({})
const motivo = ref('')

const registros = computed(() => prontuario.vigentes('anamneses'))

function novo() {
  corrigindo.value = null
  motivo.value = ''
  dados.value = {}
  dialogo.value = true
}

function corrigir(registro) {
  corrigindo.value = registro
  motivo.value = ''
  dados.value = clonarDados(registro.dados ?? {})
  dialogo.value = true
}

const valido = computed(() => String(dados.value.queixaPrincipal ?? '').trim().length > 0)

async function salvar() {
  if (!valido.value) return
  salvando.value = true
  try {
    // Campos em branco não entram no prontuário.
    const registro = { ...somenteAnamnesePreenchidos(dados.value), responsavelId: 'med-1' }

    if (corrigindo.value) {
      await prontuario.corrigirAnamnese(corrigindo.value.id, { ...registro, motivoCorrecao: motivo.value })
      toast.add({ severity: 'success', summary: 'Anamnese corrigida', life: 2500 })
    } else {
      await prontuario.salvarAnamnese(registro)
      toast.add({ severity: 'success', summary: 'Anamnese registrada', life: 2500 })
    }
    dialogo.value = false
  } finally {
    salvando.value = false
  }
}

/** Campos gravados de um registro, na ordem do catálogo. */
const camposDe = (registro) => (registro.campos ?? []).map(getAnamneseCampo).filter(Boolean)

function exibir(campo, valor) {
  if (valor == null || valor === '') return '—'
  if (campo.tipo === 'checkbox') return valor ? 'Sim' : 'Não'
  return String(valor)
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ registros.length }} anamnese(s) registrada(s)</span>
      <span class="ob-spacer" />
      <Button label="Nova anamnese" icon="pi pi-plus" @click="novo" />
    </div>

    <EmptyState
      v-if="!registros.length"
      icone="pi-comment"
      titulo="Nenhuma anamnese registrada"
      descricao="Registre a queixa principal e a história ocular do paciente."
    />

    <RegistroCard
      v-for="r in registros"
      :key="r.id"
      :registro="r"
      :versoes="prontuario.versoes('anamneses', r)"
      icone="pi-comment"
      @corrigir="corrigir"
    >
      <template #titulo>Anamnese</template>

      <dl class="leitura">
        <template v-for="campo in camposDe(r)" :key="campo.key">
          <dt>{{ campo.label }}</dt>
          <dd>{{ exibir(campo, r.dados?.[campo.key]) }}</dd>
        </template>
      </dl>

      <template #versao="{ versao }">
        <dl class="leitura">
          <template v-for="campo in camposDe(versao)" :key="campo.key">
            <dt>{{ campo.label }}</dt>
            <dd>{{ exibir(campo, versao.dados?.[campo.key]) }}</dd>
          </template>
        </dl>
      </template>
    </RegistroCard>

    <Dialog
      v-model:visible="dialogo"
      modal
      :header="corrigindo ? 'Corrigir anamnese' : 'Nova anamnese'"
      :style="{ width: '860px' }"
      :breakpoints="{ '960px': '95vw' }"
    >
      <p class="ob-muted ob-small dica">
        Responda o que for pertinente — as perguntas deixadas em branco não entram no registro.
      </p>

      <div class="form">
        <div
          v-for="campo in ANAMNESE_CAMPOS"
          :key="campo.key"
          class="campo"
          :class="{ 'campo--full': campo.largura === 'full' }"
        >
          <label v-if="campo.tipo !== 'checkbox'" :for="`ana-${campo.key}`">
            {{ campo.label }}<span v-if="campo.fixo"> *</span>
          </label>
          <CampoInput
            :campo="campo"
            :model-value="dados[campo.key]"
            @update:model-value="(v) => (dados = { ...dados, [campo.key]: v })"
          />
        </div>

        <div v-if="corrigindo" class="campo campo--full">
          <label for="motivo-anamnese">Motivo da correção</label>
          <InputText
            id="motivo-anamnese"
            v-model="motivo"
            placeholder="Ex: queixa registrada no paciente errado"
            fluid
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button
          :label="corrigindo ? 'Salvar correção' : 'Salvar anamnese'"
          icon="pi pi-check"
          :loading="salvando"
          :disabled="!valido"
          @click="salvar"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.dica { margin: 0 0 0.85rem; }

.form { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem 1rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo label { font-size: 0.8125rem; font-weight: 600; }

.leitura {
  display: grid;
  grid-template-columns: minmax(150px, max-content) 1fr;
  gap: 0.3rem 1rem;
  margin: 0;
  font-size: 0.875rem;
}
.leitura dt { color: var(--p-text-muted-color); }
.leitura dd { margin: 0; }

@media (max-width: 640px) {
  .leitura { grid-template-columns: 1fr; }
  .leitura dd { margin-bottom: 0.4rem; }
}
</style>

<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import ExameFormRenderer from './ExameFormRenderer.vue'
import { exameGrupos, getExameSchema, novoExameDados } from '@/mocks/exames/index.js'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { clonarDados } from '@/utils/formato.js'

/**
 * Registro e correção de um exame. O diálogo não sabe nada sobre os tipos de
 * exame: escolhe um schema do registry e entrega ao renderer (RNFTEC05).
 */
const props = defineProps({
  visivel: { type: Boolean, default: false },
  tipoInicial: { type: String, default: null },
  /** Quando informado, o diálogo corrige esse exame em vez de criar um novo. */
  registro: { type: Object, default: null },
})
const emit = defineEmits(['update:visivel', 'salvo'])

const toast = useToast()
const prontuario = useProntuarioStore()

const grupos = exameGrupos()
const tipo = ref(null)
const olho = ref('AO')
const dados = ref({})
const anexos = ref([])
const motivo = ref('')
const salvando = ref(false)
const pronto = ref(false)

const schema = computed(() => (tipo.value ? getExameSchema(tipo.value) : null))
const corrigindo = computed(() => Boolean(props.registro))

/**
 * Trocar de tipo ou de lateralidade remonta os dados a partir do schema.
 * `pronto` evita que isso apague os valores recém-carregados de uma correção.
 */
watch([tipo, olho], () => {
  if (!schema.value || !pronto.value) return
  dados.value = novoExameDados(schema.value, olho.value)
})

watch(() => props.visivel, async (aberto) => {
  if (!aberto) return
  pronto.value = false
  motivo.value = ''
  if (props.registro) {
    tipo.value = props.registro.tipo
    olho.value = props.registro.olho
    dados.value = clonarDados(props.registro.dados ?? {})
    anexos.value = clonarDados(props.registro.anexos ?? [])
  } else {
    tipo.value = props.tipoInicial
    olho.value = 'AO'
    anexos.value = []
    dados.value = schema.value ? novoExameDados(schema.value, 'AO') : {}
  }
  // Atribuir `tipo` agenda o observador acima; só liberamos a remontagem
  // depois que ele já rodou, senão ele apagaria o que acabamos de carregar.
  await nextTick()
  pronto.value = true
}, { immediate: true })

async function salvar() {
  if (!schema.value) return
  salvando.value = true
  try {
    const payload = {
      tipo: tipo.value,
      olho: schema.value.porOlho ? olho.value : 'AO',
      dados: dados.value,
      anexos: anexos.value,
      responsavelId: 'med-1',
    }
    const criado = corrigindo.value
      ? await prontuario.corrigirExame(props.registro.id, { ...payload, motivoCorrecao: motivo.value })
      : await prontuario.salvarExame(payload)

    toast.add({
      severity: 'success',
      summary: corrigindo.value ? 'Exame corrigido' : 'Exame registrado',
      detail: schema.value.nome,
      life: 2500,
    })
    emit('salvo', criado)
    emit('update:visivel', false)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Não foi possível salvar', detail: e.message, life: 4000 })
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <Dialog
    :visible="visivel"
    modal
    :header="corrigindo ? 'Corrigir exame' : 'Registrar exame'"
    :style="{ width: '860px' }"
    :breakpoints="{ '960px': '95vw' }"
    @update:visible="(v) => emit('update:visivel', v)"
  >
    <div class="ob-stack">
      <div class="campo">
        <label for="tipo-exame" class="campo__label">Tipo de exame</label>
        <Select
          id="tipo-exame"
          v-model="tipo"
          :options="grupos"
          option-group-label="label"
          option-group-children="items"
          option-label="nome"
          option-value="id"
          placeholder="Selecione o exame a registrar"
          :disabled="corrigindo"
          filter
          fluid
        >
          <template #optiongroup="{ option }">
            <span class="ob-small ob-muted">{{ option.label }}</span>
          </template>
          <template #option="{ option }">
            <span class="ob-row"><i class="pi" :class="option.icone" /> {{ option.nome }}</span>
          </template>
        </Select>
        <small v-if="corrigindo" class="ob-muted">
          Uma correção mantém o tipo do exame original.
        </small>
      </div>

      <ExameFormRenderer
        v-if="schema"
        :schema="schema"
        :dados="dados"
        :olho="olho"
        :anexos="anexos"
        @update:dados="(v) => (dados = v)"
        @update:olho="(v) => (olho = v)"
        @update:anexos="(v) => (anexos = v)"
      />

      <p v-else class="ob-muted ob-small">
        Selecione um tipo de exame para exibir o formulário correspondente.
      </p>

      <div v-if="corrigindo" class="campo">
        <label for="motivo-exame" class="campo__label">Motivo da correção</label>
        <InputText
          id="motivo-exame"
          v-model="motivo"
          placeholder="Ex: valor de OE digitado trocado no lançamento original"
          fluid
        />
      </div>
    </div>

    <template #footer>
      <Button label="Cancelar" text @click="emit('update:visivel', false)" />
      <Button
        :label="corrigindo ? 'Salvar correção' : 'Salvar exame'"
        icon="pi pi-check"
        :loading="salvando"
        :disabled="!schema"
        @click="salvar"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo__label { font-size: 0.8125rem; font-weight: 600; }
.campo small { font-size: 0.7rem; }
</style>

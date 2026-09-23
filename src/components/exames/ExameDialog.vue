<script setup>
import { computed, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import ExameFormRenderer from './ExameFormRenderer.vue'
import { exameGrupos, getExameSchema, novoExameDados } from '@/mocks/exames/index.js'
import { useProntuarioStore } from '@/stores/prontuario.js'

/**
 * Registro de um exame. O diálogo não sabe nada sobre os tipos de exame:
 * escolhe um schema do registry e entrega ao renderer (RNFTEC05).
 */
const props = defineProps({
  visivel: { type: Boolean, default: false },
  tipoInicial: { type: String, default: null },
  consultaId: { type: String, default: null },
})
const emit = defineEmits(['update:visivel', 'salvo'])

const toast = useToast()
const prontuario = useProntuarioStore()

const grupos = exameGrupos()
const tipo = ref(props.tipoInicial)
const olho = ref('AO')
const dados = ref({})
const anexos = ref([])
const salvando = ref(false)

const schema = computed(() => (tipo.value ? getExameSchema(tipo.value) : null))

/** Ao trocar de tipo ou de lateralidade, remonta os dados a partir do schema. */
watch([tipo, olho], () => {
  if (!schema.value) return
  dados.value = novoExameDados(schema.value, olho.value)
}, { immediate: true })

watch(() => props.visivel, (aberto) => {
  if (!aberto) return
  tipo.value = props.tipoInicial
  olho.value = 'AO'
  anexos.value = []
})

async function salvar() {
  if (!schema.value) return
  salvando.value = true
  try {
    const criado = await prontuario.salvarExame({
      consultaId: props.consultaId,
      tipo: tipo.value,
      olho: schema.value.porOlho ? olho.value : 'AO',
      dados: dados.value,
      anexos: anexos.value,
      responsavelId: 'med-1',
    })
    toast.add({ severity: 'success', summary: 'Exame registrado', detail: schema.value.nome, life: 2500 })
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
    header="Registrar exame"
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
    </div>

    <template #footer>
      <Button label="Cancelar" text @click="emit('update:visivel', false)" />
      <Button label="Salvar exame" icon="pi pi-check" :loading="salvando" :disabled="!schema" @click="salvar" />
    </template>
  </Dialog>
</template>

<style scoped>
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo__label { font-size: 0.8125rem; font-weight: 600; }
</style>

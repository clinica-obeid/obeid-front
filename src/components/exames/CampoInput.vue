<script setup>
import { computed } from 'vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox'
import DatePicker from 'primevue/datepicker'

/**
 * Renderiza um único campo primitivo a partir do seu descritor de schema.
 * É o único componente que conhece os inputs do PrimeVue — o renderer de
 * exames e os formulários clínicos apenas descrevem os campos (RNFTEC05).
 */
const props = defineProps({
  campo: { type: Object, required: true },
  modelValue: { default: null },
  compacto: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const valor = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
})

/** Campos de hora são guardados como string "HH:MM" e editados como Date. */
const horaComoData = computed({
  get: () => {
    if (!props.modelValue) return null
    const [h, m] = String(props.modelValue).split(':').map(Number)
    const d = new Date()
    d.setHours(h || 0, m || 0, 0, 0)
    return d
  },
  set: (d) => {
    emit('update:modelValue', d ? `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}` : null)
  },
})
</script>

<template>
  <InputText v-if="campo.tipo === 'text'" v-model="valor" :placeholder="campo.placeholder" fluid />

  <InputNumber
    v-else-if="campo.tipo === 'number'"
    v-model="valor"
    :suffix="campo.sufixo ? ` ${campo.sufixo}` : undefined"
    :min-fraction-digits="campo.passo && campo.passo < 1 ? 2 : 0"
    :max-fraction-digits="campo.passo && campo.passo < 1 ? 2 : 0"
    :step="campo.passo ?? 1"
    :min="campo.min"
    :max="campo.max"
    :prefix="campo.sinal && valor > 0 ? '+' : undefined"
    show-buttons
    button-layout="stacked"
    fluid
  />

  <Textarea
    v-else-if="campo.tipo === 'textarea'"
    v-model="valor"
    :rows="compacto ? 2 : 3"
    :placeholder="campo.placeholder"
    auto-resize
    fluid
  />

  <Select
    v-else-if="campo.tipo === 'select'"
    v-model="valor"
    :options="campo.opcoes"
    :placeholder="campo.placeholder ?? 'Selecione'"
    show-clear
    fluid
  />

  <MultiSelect
    v-else-if="campo.tipo === 'multiselect'"
    v-model="valor"
    :options="campo.opcoes"
    :placeholder="campo.placeholder ?? 'Selecione'"
    display="chip"
    filter
    fluid
  />

  <DatePicker
    v-else-if="campo.tipo === 'date'"
    v-model="valor"
    date-format="dd/mm/yy"
    show-icon
    fluid
  />

  <DatePicker
    v-else-if="campo.tipo === 'time'"
    v-model="horaComoData"
    time-only
    show-icon
    icon-display="input"
    fluid
  />

  <div v-else-if="campo.tipo === 'checkbox'" class="ob-row">
    <Checkbox v-model="valor" :input-id="`chk-${campo.key}`" binary />
    <label :for="`chk-${campo.key}`" class="ob-small">{{ campo.label }}</label>
  </div>

  <InputText v-else v-model="valor" fluid />
</template>

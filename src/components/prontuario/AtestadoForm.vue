<script setup>
import { ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Checkbox from 'primevue/checkbox'
import AutoComplete from 'primevue/autocomplete'
import { api } from '@/services/api.js'

/** Atestado médico (RFPRE03). */
const FINALIDADES = ['Afastamento', 'Comparecimento', 'Aptidão visual', 'Acompanhante']

const form = ref({
  finalidade: 'Afastamento',
  dias: 1,
  incluirCid: false,
  cid: null,
  texto: '',
})

const sugestoes = ref([])
async function buscarCid({ query }) {
  sugestoes.value = await api.catalogos.cid10(query)
}

const porExtenso = ['zero', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez']

/** Mantém o texto do atestado em sincronia com os campos, sem travá-lo. */
function gerarTexto() {
  const n = form.value.dias
  const extenso = porExtenso[n] ?? n
  if (form.value.finalidade === 'Afastamento') {
    return `Atesto para os devidos fins que o(a) paciente esteve sob cuidados médicos oftalmológicos nesta data, necessitando de afastamento de suas atividades habituais por ${n} (${extenso}) dia(s).`
  }
  if (form.value.finalidade === 'Comparecimento') {
    return 'Atesto para os devidos fins que o(a) paciente compareceu a consulta oftalmológica nesta data.'
  }
  if (form.value.finalidade === 'Aptidão visual') {
    return 'Atesto para os devidos fins que o(a) paciente foi submetido(a) a avaliação oftalmológica, apresentando acuidade visual compatível com suas atividades.'
  }
  return 'Atesto para os devidos fins que o(a) acompanhante esteve presente durante a consulta oftalmológica nesta data.'
}

watch(() => [form.value.finalidade, form.value.dias], () => { form.value.texto = gerarTexto() }, { immediate: true })

defineExpose({
  coletar: () => ({
    finalidade: form.value.finalidade,
    dias: form.value.dias,
    incluirCid: form.value.incluirCid,
    cid: form.value.incluirCid ? form.value.cid : null,
    texto: form.value.texto,
  }),
})
</script>

<template>
  <div class="ob-stack">
    <div class="linha">
      <div class="campo">
        <label for="finalidade">Finalidade</label>
        <Select id="finalidade" v-model="form.finalidade" :options="FINALIDADES" fluid />
      </div>
      <div v-if="form.finalidade === 'Afastamento'" class="campo">
        <label for="dias">Dias de afastamento</label>
        <InputNumber id="dias" v-model="form.dias" :min="1" :max="30" show-buttons fluid />
      </div>
    </div>

    <div class="campo">
      <span class="ob-row">
        <Checkbox v-model="form.incluirCid" input-id="incluir-cid" binary />
        <label for="incluir-cid" class="campo__inline">
          Incluir código CID no atestado (somente com autorização expressa do paciente)
        </label>
      </span>
    </div>

    <div v-if="form.incluirCid" class="campo">
      <label for="cid-atestado">CID-10</label>
      <AutoComplete
        id="cid-atestado"
        v-model="form.cid"
        :suggestions="sugestoes"
        option-label="descricao"
        force-selection
        complete-on-focus
        placeholder="Digite o código ou a descrição"
        fluid
        @complete="buscarCid"
      >
        <template #option="{ option }">
          <span><strong class="ob-mono">{{ option.codigo }}</strong> — {{ option.descricao }}</span>
        </template>
      </AutoComplete>
    </div>

    <div class="campo">
      <label for="texto">Texto do atestado</label>
      <Textarea id="texto" v-model="form.texto" rows="4" auto-resize fluid />
    </div>
  </div>
</template>

<style scoped>
.linha { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.campo__inline { font-weight: 400; font-size: 0.8125rem; }
</style>

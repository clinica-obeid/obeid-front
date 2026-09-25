<script setup>
import { ref, watch } from 'vue'
import InputNumber from 'primevue/inputnumber'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { clonarDados, formatarData } from '@/utils/formato.js'

/**
 * Receita de óculos (RFPRE01).
 *
 * Campos de grau — esfera, cilindro, eixo, adição e DP — que não têm
 * equivalente numa receita médica comum, por isso o formulário é próprio.
 */
const props = defineProps({
  ultimaRefracao: { type: Object, default: null },
  /** Valores de uma prescrição em correção; têm prioridade sobre a refração. */
  valorInicial: { type: Object, default: null },
})

const FINALIDADES = ['Uso constante', 'Para longe', 'Para perto', 'Bifocal', 'Multifocal', 'Para leitura']

const form = ref({
  finalidade: 'Uso constante',
  od: { esfera: null, cilindro: null, eixo: null, adicao: null },
  oe: { esfera: null, cilindro: null, eixo: null, adicao: null },
  dp: null,
  observacoes: '',
})

/** Traz os valores da última refração registrada — evita redigitação. */
function importarRefracao() {
  const d = props.ultimaRefracao?.dados
  if (!d) return
  for (const lado of ['od', 'oe']) {
    form.value[lado] = {
      esfera: d[lado]?.esfera ?? null,
      cilindro: d[lado]?.cilindro ?? null,
      eixo: d[lado]?.eixo ?? null,
      adicao: d[lado]?.adicao ?? null,
    }
  }
  form.value.dp = d.dp ?? null
}

watch(
  () => [props.valorInicial, props.ultimaRefracao],
  () => {
    if (props.valorInicial) form.value = clonarDados(props.valorInicial)
    else importarRefracao()
  },
  { immediate: true },
)

defineExpose({ coletar: () => clonarDados(form.value) })
</script>

<template>
  <div class="ob-stack">
    <Message v-if="valorInicial" severity="secondary" :closable="false">
      Corrigindo um documento já emitido. A versão anterior continua registrada no prontuário.
    </Message>
    <Message v-else-if="ultimaRefracao" severity="info" :closable="false">
      <div class="ob-row-wrap">
        <span>
          Valores importados da refração de <strong>{{ formatarData(ultimaRefracao.data) }}</strong>.
        </span>
        <Button label="Reimportar" icon="pi pi-refresh" size="small" text @click="importarRefracao" />
      </div>
    </Message>
    <Message v-else-if="!valorInicial" severity="warn" :closable="false">
      Nenhuma refração registrada para este paciente — preencha os graus manualmente.
    </Message>

    <div class="campo">
      <label for="finalidade">Finalidade</label>
      <Select id="finalidade" v-model="form.finalidade" :options="FINALIDADES" fluid />
    </div>

    <table class="graus">
      <thead>
        <tr>
          <th />
          <th>Esfera</th>
          <th>Cilindro</th>
          <th>Eixo</th>
          <th>Adição</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="lado in ['od', 'oe']" :key="lado">
          <th scope="row">
            <span class="ob-eye" :class="`ob-eye--${lado}`">{{ lado.toUpperCase() }}</span>
          </th>
          <td data-rotulo="Esfera">
            <InputNumber v-model="form[lado].esfera" aria-label="Esfera" :step="0.25" :min-fraction-digits="2" :max-fraction-digits="2"
              suffix=" D" show-buttons button-layout="stacked" fluid />
          </td>
          <td data-rotulo="Cilindro">
            <InputNumber v-model="form[lado].cilindro" aria-label="Cilindro" :step="0.25" :min-fraction-digits="2" :max-fraction-digits="2"
              suffix=" D" show-buttons button-layout="stacked" fluid />
          </td>
          <td data-rotulo="Eixo">
            <InputNumber v-model="form[lado].eixo" aria-label="Eixo" :step="1" :min="0" :max="180" suffix="°"
              show-buttons button-layout="stacked" fluid />
          </td>
          <td data-rotulo="Adição">
            <InputNumber v-model="form[lado].adicao" aria-label="Adição" :step="0.25" :min-fraction-digits="2" :max-fraction-digits="2"
              suffix=" D" show-buttons button-layout="stacked" fluid />
          </td>
        </tr>
      </tbody>
    </table>

    <div class="linha">
      <div class="campo">
        <label for="dp">Distância pupilar</label>
        <InputNumber id="dp" v-model="form.dp" :step="0.5" suffix=" mm" fluid />
      </div>
    </div>

    <div class="campo">
      <label for="obs-oculos">Observações para o óptico</label>
      <Textarea id="obs-oculos" v-model="form.observacoes" rows="2" auto-resize fluid
        placeholder="Ex: lentes com tratamento antirreflexo" />
    </div>
  </div>
</template>

<style scoped>
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.linha { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; }

.graus { width: 100%; border-collapse: separate; border-spacing: 0.35rem; }
.graus th {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  text-align: left;
}
.graus tbody th { width: 46px; }

@media (max-width: 720px) {
  .graus, .graus tbody, .graus tr, .graus td, .graus tbody th { display: block; width: 100%; }
  .graus thead { display: none; }
  .graus tr { border: 1px solid var(--p-content-border-color); border-radius: var(--ob-radius); padding: 0.5rem; margin-bottom: 0.5rem; }
  .graus td::before {
    content: attr(data-rotulo);
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--p-text-muted-color);
    margin-bottom: 0.15rem;
  }
}
</style>

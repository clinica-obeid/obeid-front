<script setup>
import { computed } from 'vue'
import { getExameSchema } from '@/mocks/exames/index.js'

/** Leitura de um exame salvo — também dirigida pelo schema (RFEXA17). */
const props = defineProps({ exame: { type: Object, required: true } })

const schema = computed(() => getExameSchema(props.exame.tipo))

const lados = computed(() => {
  if (!schema.value?.porOlho) return []
  if (props.exame.olho === 'OD') return ['od']
  if (props.exame.olho === 'OE') return ['oe']
  return ['od', 'oe']
})

const camposPorOlho = computed(() =>
  schema.value?.porOlho ? schema.value.campos.filter((c) => c.porOlho) : [])

const camposGerais = computed(() =>
  (schema.value?.campos ?? []).filter((c) => !(c.porOlho && schema.value.porOlho)))

/** Formata um valor conforme o tipo declarado no schema. */
function exibir(campo, valor) {
  if (valor == null || valor === '') return '—'
  if (campo.tipo === 'checkbox') return valor ? 'Sim' : 'Não'
  if (campo.tipo === 'multiselect') return valor.join(', ') || '—'
  if (campo.tipo === 'repeater') return `${valor.length} registro(s)`
  if (campo.tipo === 'number' && campo.sufixo) return `${valor} ${campo.sufixo}`
  return String(valor)
}

const temValor = (v) => v != null && v !== '' && !(Array.isArray(v) && !v.length)
</script>

<template>
  <div v-if="schema" class="leitura ob-stack">
    <!-- séries de medições -->
    <template v-for="campo in schema.campos.filter((c) => c.tipo === 'repeater')" :key="campo.key">
      <table v-if="exame.dados[campo.key]?.length" class="leitura__serie">
        <caption>{{ campo.label }}</caption>
        <thead>
          <tr><th v-for="col in campo.colunas" :key="col.key">{{ col.label }}</th></tr>
        </thead>
        <tbody>
          <tr v-for="(linha, i) in exame.dados[campo.key]" :key="i">
            <td v-for="col in campo.colunas" :key="col.key" class="ob-mono">
              {{ linha[col.key] ?? '—' }}{{ linha[col.key] != null && col.sufixo ? ` ${col.sufixo}` : '' }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <!-- medidas por olho -->
    <table v-if="camposPorOlho.length" class="leitura__olhos">
      <thead>
        <tr>
          <th />
          <th v-for="lado in lados" :key="lado">
            <span class="ob-eye" :class="`ob-eye--${lado}`">{{ lado.toUpperCase() }}</span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="campo in camposPorOlho" :key="campo.key">
          <th scope="row">{{ campo.label }}</th>
          <td v-for="lado in lados" :key="lado">{{ exibir(campo, exame.dados[lado]?.[campo.key]) }}</td>
        </tr>
      </tbody>
    </table>

    <!-- campos gerais preenchidos -->
    <dl v-if="camposGerais.some((c) => temValor(exame.dados[c.key]))" class="leitura__gerais">
      <template v-for="campo in camposGerais" :key="campo.key">
        <template v-if="temValor(exame.dados[campo.key]) && campo.tipo !== 'repeater'">
          <dt>{{ campo.label }}</dt>
          <dd>{{ exibir(campo, exame.dados[campo.key]) }}</dd>
        </template>
      </template>
    </dl>

    <!-- anexos -->
    <ul v-if="exame.anexos?.length" class="leitura__anexos">
      <li v-for="(anexo, i) in exame.anexos" :key="i">
        <i class="pi" :class="anexo.tipo?.startsWith('image/') ? 'pi-image' : 'pi-file-pdf'" />
        <a v-if="anexo.url" :href="anexo.url" target="_blank" rel="noopener">{{ anexo.nome }}</a>
        <span v-else>{{ anexo.nome }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.leitura { gap: 0.75rem; }

.leitura__olhos, .leitura__serie { border-collapse: collapse; width: 100%; font-size: 0.8125rem; }
.leitura__olhos th, .leitura__olhos td,
.leitura__serie th, .leitura__serie td {
  padding: 0.3rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--p-content-border-color);
}
.leitura__olhos thead th, .leitura__serie thead th {
  font-size: 0.72rem;
  color: var(--p-text-muted-color);
  font-weight: 600;
}
.leitura__olhos tbody th { font-weight: 500; width: 40%; color: var(--p-text-muted-color); }
.leitura__serie caption { text-align: left; font-weight: 600; padding-bottom: 0.25rem; }

.leitura__gerais {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.2rem 0.75rem;
  margin: 0;
  font-size: 0.8125rem;
}
.leitura__gerais dt { color: var(--p-text-muted-color); }
.leitura__gerais dd { margin: 0; }

.leitura__anexos { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.75rem; font-size: 0.8125rem; }
.leitura__anexos li { display: inline-flex; align-items: center; gap: 0.3rem; }
</style>

<script setup>
import { computed } from 'vue'
import SelectButton from 'primevue/selectbutton'
import CampoInput from './CampoInput.vue'
import CampoRepeater from './CampoRepeater.vue'
import CampoAnexos from './CampoAnexos.vue'

/**
 * Formulário genérico de exame (RFEXA17 / RNFTEC05).
 *
 * Monta a tela inteira a partir do descritor declarativo do exame. Nenhum
 * tipo de exame tem componente próprio: um exame novo é um arquivo em
 * `src/mocks/exames/` e aparece aqui automaticamente.
 */
const props = defineProps({
  schema: { type: Object, required: true },
  dados: { type: Object, required: true },
  olho: { type: String, default: 'AO' },
  anexos: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:dados', 'update:olho', 'update:anexos'])

const OPCOES_OLHO = [
  { label: 'OD', value: 'OD' },
  { label: 'OE', value: 'OE' },
  { label: 'Ambos', value: 'AO' },
]

/** Lados efetivamente editáveis conforme a lateralidade escolhida. */
const lados = computed(() => {
  if (!props.schema.porOlho) return []
  if (props.olho === 'OD') return [{ chave: 'od', rotulo: 'Olho direito (OD)', classe: 'od' }]
  if (props.olho === 'OE') return [{ chave: 'oe', rotulo: 'Olho esquerdo (OE)', classe: 'oe' }]
  return [
    { chave: 'od', rotulo: 'Olho direito (OD)', classe: 'od' },
    { chave: 'oe', rotulo: 'Olho esquerdo (OE)', classe: 'oe' },
  ]
})

const camposPorOlho = computed(() =>
  props.schema.porOlho ? props.schema.campos.filter((c) => c.porOlho) : [])

const camposGerais = computed(() =>
  props.schema.campos.filter((c) => !(c.porOlho && props.schema.porOlho) && c.tipo !== 'repeater'))

const camposSerie = computed(() => props.schema.campos.filter((c) => c.tipo === 'repeater'))

function definirGeral(chave, valor) {
  emit('update:dados', { ...props.dados, [chave]: valor })
}

function definirPorOlho(lado, chave, valor) {
  emit('update:dados', {
    ...props.dados,
    [lado]: { ...(props.dados[lado] ?? {}), [chave]: valor },
  })
}
</script>

<template>
  <div class="exame ob-stack">
    <header class="exame__cab">
      <div>
        <h3 class="exame__titulo"><i class="pi" :class="schema.icone" /> {{ schema.nome }}</h3>
        <p class="ob-muted ob-small exame__desc">{{ schema.descricao }}</p>
      </div>
      <SelectButton
        v-if="schema.porOlho"
        :model-value="olho"
        :options="OPCOES_OLHO"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Lateralidade do exame"
        @update:model-value="(v) => emit('update:olho', v)"
      />
    </header>

    <!-- Campos aplicáveis ao exame como um todo -->
    <div v-if="camposGerais.length" class="exame__gerais">
      <div
        v-for="campo in camposGerais"
        :key="campo.key"
        class="campo"
        :class="{ 'campo--full': campo.largura === 'full' }"
      >
        <label v-if="campo.tipo !== 'checkbox'" class="campo__label" :for="campo.key">
          {{ campo.label }}
          <span v-if="campo.sufixo" class="ob-muted">({{ campo.sufixo }})</span>
        </label>
        <CampoInput
          :campo="campo"
          :model-value="dados[campo.key]"
          @update:model-value="(v) => definirGeral(campo.key, v)"
        />
        <small v-if="campo.ajuda" class="campo__ajuda ob-muted">{{ campo.ajuda }}</small>
      </div>
    </div>

    <!-- Campos com lateralidade: uma coluna por olho (RFEXA17) -->
    <div v-if="camposPorOlho.length" class="olhos" :style="{ '--colunas': lados.length }">
      <div class="olhos__cabecalho">
        <span class="olhos__rotulo" />
        <span v-for="lado in lados" :key="lado.chave" class="olhos__titulo">
          <span class="ob-eye" :class="`ob-eye--${lado.classe}`">{{ lado.chave.toUpperCase() }}</span>
          {{ lado.rotulo }}
        </span>
      </div>

      <div v-for="campo in camposPorOlho" :key="campo.key" class="olhos__linha">
        <span class="olhos__rotulo">
          {{ campo.label }}
          <small v-if="campo.sufixo" class="ob-muted">({{ campo.sufixo }})</small>
          <small v-if="campo.ajuda" class="olhos__ajuda ob-muted">{{ campo.ajuda }}</small>
        </span>
        <div v-for="lado in lados" :key="lado.chave" class="olhos__campo">
          <span class="olhos__marcador ob-small ob-muted">{{ lado.chave.toUpperCase() }}</span>
          <CampoInput
            :campo="{ ...campo, key: `${lado.chave}-${campo.key}` }"
            :model-value="dados[lado.chave]?.[campo.key]"
            compacto
            @update:model-value="(v) => definirPorOlho(lado.chave, campo.key, v)"
          />
        </div>
      </div>
    </div>

    <!-- Séries de medições -->
    <div v-for="campo in camposSerie" :key="campo.key" class="campo campo--full">
      <label class="campo__label">{{ campo.label }}</label>
      <CampoRepeater
        :campo="campo"
        :model-value="dados[campo.key]"
        @update:model-value="(v) => definirGeral(campo.key, v)"
      />
    </div>

    <!-- Anexos (RFEXA18) -->
    <div v-if="schema.permiteAnexos" class="campo campo--full">
      <label class="campo__label">Anexos</label>
      <CampoAnexos :model-value="anexos" @update:model-value="(v) => emit('update:anexos', v)" />
    </div>
  </div>
</template>

<style scoped>
.exame__cab {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.exame__titulo { font-size: 1.05rem; display: flex; align-items: center; gap: 0.45rem; }
.exame__titulo .pi { color: var(--p-primary-500); }
.exame__desc { margin: 0.2rem 0 0; max-width: 60ch; }

.exame__gerais {
  display: grid;
  gap: 0.85rem 1rem;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
}

.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo__label { font-size: 0.8125rem; font-weight: 600; }
.campo__ajuda { font-size: 0.7rem; }

/* Grade OD/OE: rótulo à esquerda, um campo por olho. */
.olhos {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding-top: 0.25rem;
  border-top: 1px solid var(--p-content-border-color);
}
.olhos__cabecalho,
.olhos__linha {
  display: grid;
  grid-template-columns: minmax(150px, 1fr) repeat(var(--colunas), minmax(0, 1.2fr));
  gap: 0.5rem 0.75rem;
  align-items: start;
}
.olhos__cabecalho { padding: 0.5rem 0 0.25rem; }
.olhos__titulo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}
.olhos__rotulo { font-size: 0.8125rem; font-weight: 600; padding-top: 0.5rem; }
.olhos__rotulo small { font-weight: 400; }
.olhos__ajuda { display: block; font-size: 0.7rem; font-weight: 400; }
.olhos__campo { min-width: 0; }
.olhos__marcador { display: none; }

/* Tablet retrato: os olhos empilham e cada campo ganha seu próprio marcador. */
@media (max-width: 860px) {
  .olhos__cabecalho { display: none; }
  .olhos__linha {
    grid-template-columns: 1fr;
    padding-bottom: 0.5rem;
    border-bottom: 1px dashed var(--p-content-border-color);
  }
  .olhos__rotulo { padding-top: 0; }
  .olhos__campo { display: flex; align-items: center; gap: 0.5rem; }
  .olhos__marcador { display: inline; min-width: 1.6rem; font-weight: 700; }
  .olhos__campo > :deep(*:last-child) { flex: 1; }
}
</style>

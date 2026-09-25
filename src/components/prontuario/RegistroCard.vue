<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { formatarData, formatarDataHora } from '@/utils/formato.js'

/**
 * Cartão de um registro clínico, com correção e histórico de versões.
 *
 * Num prontuário nada se apaga: corrigir grava uma versão nova e a anterior
 * continua acessível aqui. As cinco abas (anamnese, exames, procedimentos,
 * diagnósticos e prescrições) usam este mesmo cartão, passando o seu conteúdo
 * pelos slots.
 */
const props = defineProps({
  registro: { type: Object, required: true },
  /** Versões substituídas, da mais recente para a mais antiga. */
  versoes: { type: Array, default: () => [] },
  icone: { type: String, default: '' },
  corrigivel: { type: Boolean, default: true },
})
defineEmits(['corrigir'])

const aberto = ref(false)

/** Plural irregular de "versão": 1 versão anterior · 3 versões anteriores. */
const rotuloVersoes = computed(() =>
  props.versoes.length === 1
    ? '1 versão anterior'
    : `${props.versoes.length} versões anteriores`)

</script>

<template>
  <Card class="registro">
    <template #title>
      <div class="registro__cab">
        <i v-if="icone" class="pi" :class="icone" />
        <span class="registro__titulo"><slot name="titulo" /></span>
        <slot name="marcadores" />
        <span class="ob-spacer" />
        <span class="ob-small ob-muted">{{ formatarData(registro.data) }}</span>
        <Button
          v-if="corrigivel"
          label="Corrigir"
          icon="pi pi-pencil"
          size="small"
          text
          @click="$emit('corrigir', registro)"
        />
      </div>
    </template>

    <template v-if="$slots.resumo" #subtitle>
      <span class="ob-small ob-muted"><slot name="resumo" /></span>
    </template>

    <template #content>
      <slot />

      <!-- Cadeia de correções -->
      <div v-if="versoes.length" class="versoes">
        <button type="button" class="versoes__alternar" @click="aberto = !aberto">
          <i class="pi" :class="aberto ? 'pi-chevron-down' : 'pi-chevron-right'" />
          {{ rotuloVersoes }}
          <span v-if="registro.criadoEm" class="ob-muted">
            · corrigido em {{ formatarDataHora(registro.criadoEm) }}
          </span>
        </button>

        <p v-if="registro.motivoCorrecao && aberto" class="versoes__motivo ob-small">
          <strong>Motivo da correção:</strong> {{ registro.motivoCorrecao }}
        </p>

        <div v-if="aberto" class="versoes__lista">
          <article v-for="(versao, i) in versoes" :key="versao.id" class="versoes__item">
            <header class="versoes__item-cab">
              <Tag value="Substituída" severity="secondary" icon="pi pi-history" />
              <span class="ob-small ob-muted">
                registrada em {{ formatarDataHora(versao.criadoEm) }}
              </span>
            </header>
            <slot name="versao" :versao="versao" :indice="i" />
          </article>
        </div>
      </div>
    </template>
  </Card>
</template>

<style scoped>
.registro__cab { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.registro__cab > .pi { color: var(--p-primary-500); }
.registro__titulo { font-size: 1rem; }

.versoes {
  margin-top: 0.85rem;
  padding-top: 0.6rem;
  border-top: 1px dashed var(--p-content-border-color);
}
.versoes__alternar {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0;
  border: 0;
  background: none;
  cursor: pointer;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}
.versoes__alternar:hover { color: var(--p-text-color); }
.versoes__alternar .pi { font-size: 0.7rem; }
.versoes__alternar .ob-muted { font-weight: 400; }

.versoes__motivo { margin: 0.5rem 0 0; }

.versoes__lista { display: flex; flex-direction: column; gap: 0.6rem; margin-top: 0.6rem; }
.versoes__item {
  padding: 0.6rem 0.75rem;
  border-radius: var(--ob-radius);
  background: var(--ob-realce);
  opacity: 0.85;
}
.versoes__item-cab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.4rem;
}
.versoes__item-cab :deep(.p-tag) { font-size: 0.68rem; }
</style>

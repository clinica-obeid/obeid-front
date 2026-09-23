<script setup>
import { onBeforeUnmount, ref } from 'vue'
import Button from 'primevue/button'

/**
 * Anexos de exame (RFEXA18). No protótipo nada é enviado a um servidor:
 * os arquivos ficam apenas na sessão, com preview via object URL.
 */
const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])

const input = ref(null)
const urls = []

function selecionar(evento) {
  const arquivos = [...evento.target.files]
  const novos = arquivos.map((f) => {
    const url = URL.createObjectURL(f)
    urls.push(url)
    return { nome: f.name, tipo: f.type, tamanho: f.size, url }
  })
  emit('update:modelValue', [...(props.modelValue ?? []), ...novos])
  evento.target.value = ''
}

function remover(indice) {
  emit('update:modelValue', props.modelValue.filter((_, i) => i !== indice))
}

const eImagem = (a) => a.tipo?.startsWith('image/') || a.demo === 'fundo'
const tamanho = (bytes) => (bytes > 1e6 ? `${(bytes / 1e6).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`)

onBeforeUnmount(() => urls.forEach((u) => URL.revokeObjectURL(u)))
</script>

<template>
  <div class="anexos">
    <ul v-if="modelValue?.length" class="anexos__lista">
      <li v-for="(anexo, i) in modelValue" :key="i" class="anexos__item">
        <img v-if="anexo.url && eImagem(anexo)" :src="anexo.url" :alt="anexo.nome" class="anexos__thumb" />
        <span v-else class="anexos__icone">
          <i class="pi" :class="eImagem(anexo) ? 'pi-image' : 'pi-file-pdf'" />
        </span>
        <span class="anexos__info">
          <a v-if="anexo.url" :href="anexo.url" target="_blank" rel="noopener" class="ob-truncate">{{ anexo.nome }}</a>
          <span v-else class="ob-truncate">{{ anexo.nome }}</span>
          <small class="ob-muted">{{ tamanho(anexo.tamanho) }}</small>
        </span>
        <Button icon="pi pi-times" text rounded size="small" :aria-label="`Remover ${anexo.nome}`" @click="remover(i)" />
      </li>
    </ul>

    <input ref="input" type="file" multiple accept="image/*,application/pdf" hidden @change="selecionar" />
    <Button label="Anexar arquivo" icon="pi pi-paperclip" size="small" outlined @click="input.click()" />
    <small class="ob-muted ob-small">Imagens de fundo de olho, laudos em PDF, exportações do equipamento.</small>
  </div>
</template>

<style scoped>
.anexos { display: flex; flex-direction: column; align-items: flex-start; gap: 0.5rem; }
.anexos__lista { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.anexos__item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
  max-width: 260px;
}
.anexos__thumb { width: 34px; height: 34px; object-fit: cover; border-radius: 6px; }
.anexos__icone {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 6px;
  background: var(--ob-realce);
  color: var(--p-text-muted-color);
}
.anexos__info { display: flex; flex-direction: column; min-width: 0; font-size: 0.8125rem; }
.anexos__info small { font-size: 0.7rem; }
</style>

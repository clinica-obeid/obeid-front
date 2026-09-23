<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { api } from '@/services/api.js'
import { formatarData } from '@/utils/formato.js'

/** Diagnóstico com CID-10 (RFDIA01) e plano terapêutico (RFDIA02). */
const props = defineProps({ consultaId: { type: String, default: null } })

const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const editando = ref(false)
const salvando = ref(false)
const cids = ref([])
const sugestoes = ref([])
const plano = ref('')

async function buscarCid({ query }) {
  sugestoes.value = await api.catalogos.cid10(query)
}

async function salvar() {
  if (!cids.value.length) return
  salvando.value = true
  try {
    await prontuario.salvarDiagnostico({
      consultaId: props.consultaId,
      cids: cids.value.map((c) => ({ codigo: c.codigo, descricao: c.descricao })),
      planoTerapeutico: plano.value,
      responsavelId: 'med-1',
    })
    cids.value = []
    plano.value = ''
    editando.value = false
    toast.add({ severity: 'success', summary: 'Diagnóstico registrado', life: 2500 })
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ prontuario.diagnosticos.length }} registro(s)</span>
      <span class="ob-spacer" />
      <Button v-if="!editando" label="Novo diagnóstico" icon="pi pi-plus" @click="editando = true" />
    </div>

    <Card v-if="editando">
      <template #title>Novo diagnóstico</template>
      <template #content>
        <div class="ob-stack">
          <div class="campo">
            <label for="cid">Diagnóstico(s) — CID-10</label>
            <AutoComplete
              id="cid"
              v-model="cids"
              :suggestions="sugestoes"
              multiple
              force-selection
              complete-on-focus
              placeholder="Digite o código ou a descrição"
              fluid
              @complete="buscarCid"
            >
              <template #option="{ option }">
                <span><strong class="ob-mono">{{ option.codigo }}</strong> — {{ option.descricao }}</span>
              </template>
              <template #chip="{ value }">
                <span class="ob-mono">{{ value.codigo }}</span>
              </template>
            </AutoComplete>
            <small class="ob-muted">
              Catálogo com {{ catalogos.cid10.length }} códigos oftalmológicos.
            </small>
          </div>

          <div class="campo">
            <label for="plano">Plano terapêutico / conduta</label>
            <Textarea
              id="plano"
              v-model="plano"
              rows="4"
              auto-resize
              fluid
              placeholder="Medicação, orientações, exames solicitados e intervalo de retorno"
            />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="ob-row">
          <Button label="Cancelar" text @click="editando = false" />
          <Button label="Salvar" icon="pi pi-check" :loading="salvando" :disabled="!cids.length" @click="salvar" />
        </div>
      </template>
    </Card>

    <EmptyState
      v-if="!prontuario.diagnosticos.length && !editando"
      icone="pi-tag"
      titulo="Nenhum diagnóstico registrado"
      descricao="Associe códigos CID-10 e registre a conduta terapêutica."
    />

    <Card v-for="d in prontuario.diagnosticos" :key="d.id">
      <template #title>
        <span class="ob-row">
          <i class="pi pi-tag" />
          <span class="diag__data">{{ formatarData(d.data) }}</span>
        </span>
      </template>
      <template #content>
        <div class="ob-row-wrap diag__cids">
          <Tag v-for="c in d.cids" :key="c.codigo" severity="secondary">
            <span class="ob-mono">{{ c.codigo }}</span> — {{ c.descricao }}
          </Tag>
        </div>
        <p class="diag__plano">{{ d.planoTerapeutico }}</p>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.campo small { font-size: 0.7rem; }

.diag__data { font-size: 1rem; }
.diag__cids { margin-bottom: 0.6rem; }
.diag__plano { margin: 0; font-size: 0.875rem; line-height: 1.55; }
</style>

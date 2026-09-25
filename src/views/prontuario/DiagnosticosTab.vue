<script setup>
import { computed, ref } from 'vue'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import AutoComplete from 'primevue/autocomplete'
import Textarea from 'primevue/textarea'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import RegistroCard from '@/components/prontuario/RegistroCard.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { api } from '@/services/api.js'
import { clonarDados } from '@/utils/formato.js'

/** Diagnóstico com CID-10 (RFDIA01) e plano terapêutico (RFDIA02). */
const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const dialogo = ref(false)
const corrigindo = ref(null)
const salvando = ref(false)
const cids = ref([])
const sugestoes = ref([])
const plano = ref('')
const motivo = ref('')

const registros = computed(() => prontuario.vigentes('diagnosticos'))

async function buscarCid({ query }) {
  sugestoes.value = await api.catalogos.cid10(query)
}

function novo() {
  corrigindo.value = null
  cids.value = []
  plano.value = ''
  motivo.value = ''
  dialogo.value = true
}

function corrigir(registro) {
  corrigindo.value = registro
  cids.value = clonarDados(registro.cids ?? [])
  plano.value = registro.planoTerapeutico ?? ''
  motivo.value = ''
  dialogo.value = true
}

async function salvar() {
  if (!cids.value.length) return
  salvando.value = true
  try {
    const payload = {
      cids: cids.value.map((c) => ({ codigo: c.codigo, descricao: c.descricao })),
      planoTerapeutico: plano.value,
      responsavelId: 'med-1',
    }
    if (corrigindo.value) {
      await prontuario.corrigirDiagnostico(corrigindo.value.id, { ...payload, motivoCorrecao: motivo.value })
      toast.add({ severity: 'success', summary: 'Diagnóstico corrigido', life: 2500 })
    } else {
      await prontuario.salvarDiagnostico(payload)
      toast.add({ severity: 'success', summary: 'Diagnóstico registrado', life: 2500 })
    }
    dialogo.value = false
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ registros.length }} registro(s)</span>
      <span class="ob-spacer" />
      <Button label="Novo diagnóstico" icon="pi pi-plus" @click="novo" />
    </div>
    <EmptyState
      v-if="!registros.length"
      icone="pi-tag"
      titulo="Nenhum diagnóstico registrado"
      descricao="Associe códigos CID-10 e registre a conduta terapêutica."
    />

    <RegistroCard
      v-for="d in registros"
      :key="d.id"
      :registro="d"
      :versoes="prontuario.versoes('diagnosticos', d)"
      icone="pi-tag"
      @corrigir="corrigir"
    >
      <template #titulo>Diagnóstico e conduta</template>

      <div class="ob-row-wrap diag__cids">
        <Tag v-for="c in d.cids" :key="c.codigo" severity="secondary">
          <span class="ob-mono">{{ c.codigo }}</span> — {{ c.descricao }}
        </Tag>
      </div>
      <p class="diag__plano">{{ d.planoTerapeutico }}</p>

      <template #versao="{ versao }">
        <div class="ob-row-wrap diag__cids">
          <Tag v-for="c in versao.cids" :key="c.codigo" severity="secondary">
            <span class="ob-mono">{{ c.codigo }}</span> — {{ c.descricao }}
          </Tag>
        </div>
        <p class="diag__plano">{{ versao.planoTerapeutico }}</p>
      </template>
    </RegistroCard>

    <Dialog
      v-model:visible="dialogo"
      modal
      :header="corrigindo ? 'Corrigir diagnóstico' : 'Novo diagnóstico'"
      :style="{ width: '640px' }"
      :breakpoints="{ '700px': '95vw' }"
    >
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

        <div v-if="corrigindo" class="campo">
          <label for="dia-motivo">Motivo da correção</label>
          <InputText id="dia-motivo" v-model="motivo" placeholder="Ex: conduta revista após novo exame" fluid />
        </div>
      </div>

      <template #footer>
        <Button label="Cancelar" text @click="dialogo = false" />
        <Button
          :label="corrigindo ? 'Salvar correção' : 'Salvar'"
          icon="pi pi-check"
          :loading="salvando"
          :disabled="!cids.length"
          @click="salvar"
        />
      </template>
    </Dialog>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.campo small { font-size: 0.7rem; }

.diag__cids { margin-bottom: 0.6rem; }
.diag__plano { margin: 0; font-size: 0.875rem; line-height: 1.55; }
</style>

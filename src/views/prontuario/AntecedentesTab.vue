<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import MultiSelect from 'primevue/multiselect'
import { useToast } from 'primevue/usetoast'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useCatalogosStore } from '@/stores/catalogos.js'

/**
 * Antecedentes do paciente (RFCAD02) — estado atual, não lançamento datado,
 * por isso ficam fora do esquema de correção: são simplesmente atualizados.
 */
const pacientes = usePacientesStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const paciente = computed(() => pacientes.atual)
const editando = ref(null)
const rascunho = ref(null)

const GRUPOS = [
  { key: 'doencasOculares', titulo: 'Doenças oculares', icone: 'pi-eye', tipo: 'lista', catalogo: 'doencasOculares' },
  { key: 'comorbidades', titulo: 'Doenças sistêmicas', icone: 'pi-heart', tipo: 'lista', catalogo: 'comorbidades' },
  { key: 'cirurgiasOculares', titulo: 'Cirurgias oculares prévias', icone: 'pi-wrench', tipo: 'texto', dica: 'Uma por linha. Ex: facectomia com implante de LIO — OD (2019)' },
]

/** Observações gerais ficam no paciente, não dentro de `historico`. */
const OBSERVACOES = { key: 'observacoes', titulo: 'Observações', icone: 'pi-align-left' }
const editandoObs = ref(false)
const rascunhoObs = ref('')

function abrirObs() {
  rascunhoObs.value = paciente.value?.observacoes ?? ''
  editandoObs.value = true
}

async function salvarObs() {
  await pacientes.atualizar(paciente.value.id, { observacoes: rascunhoObs.value })
  editandoObs.value = false
  toast.add({ severity: 'success', summary: 'Observações atualizadas', life: 2000 })
}

const valores = (key) => paciente.value?.historico?.[key] ?? []

function abrir(grupo) {
  editando.value = grupo.key
  rascunho.value = grupo.tipo === 'texto' ? valores(grupo.key).join('\n') : [...valores(grupo.key)]
}

async function salvar(grupo) {
  const lista = grupo.tipo === 'texto'
    ? rascunho.value.split('\n').map((s) => s.trim()).filter(Boolean)
    : rascunho.value

  await pacientes.atualizar(paciente.value.id, {
    historico: { ...paciente.value.historico, [grupo.key]: lista },
  })
  editando.value = null
  toast.add({ severity: 'success', summary: `${grupo.titulo} atualizado(a)`, life: 2000 })
}
</script>

<template>
  <div v-if="paciente" class="grupos">
    <Card v-for="grupo in GRUPOS" :key="grupo.key">
      <template #title>
        <div class="grupo__cab">
          <i class="pi" :class="grupo.icone" />
          <span class="grupo__titulo">{{ grupo.titulo }}</span>
          <span class="ob-spacer" />
          <Button
            v-if="editando !== grupo.key"
            label="Editar"
            icon="pi pi-pencil"
            size="small"
            text
            @click="abrir(grupo)"
          />
        </div>
      </template>

      <template #content>
        <!-- Edição -->
        <div v-if="editando === grupo.key" class="ob-stack">
          <MultiSelect
            v-if="grupo.tipo === 'lista'"
            v-model="rascunho"
            :options="catalogos[grupo.catalogo]"
            display="chip"
            filter
            placeholder="Selecione"
            fluid
          />
          <Textarea v-else v-model="rascunho" rows="4" auto-resize :placeholder="grupo.dica" fluid />

          <div class="ob-row">
            <Button label="Cancelar" size="small" text @click="editando = null" />
            <Button label="Salvar" icon="pi pi-check" size="small" :loading="pacientes.salvando" @click="salvar(grupo)" />
          </div>
        </div>

        <!-- Leitura -->
        <template v-else>
          <div v-if="grupo.tipo === 'lista' && valores(grupo.key).length" class="ob-row-wrap">
            <Tag v-for="item in valores(grupo.key)" :key="item" :value="item" severity="secondary" />
          </div>
          <ul v-else-if="valores(grupo.key).length" class="grupo__lista">
            <li v-for="item in valores(grupo.key)" :key="item">{{ item }}</li>
          </ul>
          <p v-else class="ob-muted ob-small">Nada registrado.</p>
        </template>
      </template>
    </Card>

    <Card>
      <template #title>
        <div class="grupo__cab">
          <i class="pi" :class="OBSERVACOES.icone" />
          <span class="grupo__titulo">{{ OBSERVACOES.titulo }}</span>
          <span class="ob-spacer" />
          <Button v-if="!editandoObs" label="Editar" icon="pi pi-pencil" size="small" text @click="abrirObs" />
        </div>
      </template>
      <template #content>
        <div v-if="editandoObs" class="ob-stack">
          <Textarea v-model="rascunhoObs" rows="4" auto-resize fluid
            placeholder="Anotações gerais sobre o paciente" />
          <div class="ob-row">
            <Button label="Cancelar" size="small" text @click="editandoObs = false" />
            <Button label="Salvar" icon="pi pi-check" size="small" :loading="pacientes.salvando" @click="salvarObs" />
          </div>
        </div>
        <p v-else-if="paciente.observacoes" class="grupo__texto">{{ paciente.observacoes }}</p>
        <p v-else class="ob-muted ob-small">Nada registrado.</p>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.grupos {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: var(--ob-gap);
  align-items: start;
}
.grupo__cab { display: flex; align-items: center; gap: 0.5rem; }
.grupo__cab > .pi { color: var(--p-primary-500); }
.grupo__titulo { font-size: 1rem; }

.grupo__lista { margin: 0; padding-left: 1.1rem; font-size: 0.875rem; }
.grupo__lista li { margin-bottom: 0.2rem; }
.grupo__texto { margin: 0; font-size: 0.875rem; line-height: 1.55; }
</style>

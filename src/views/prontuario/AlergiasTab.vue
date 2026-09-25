<script setup>
import { computed, ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { clonarDados } from '@/utils/formato.js'

/**
 * Alergias medicamentosas (RFCAD03).
 *
 * Alimentam o aviso permanente no cabeçalho do prontuário e o alerta exibido
 * na hora de prescrever, por isso têm lugar próprio e não ficam escondidas
 * no cadastro.
 */
const pacientes = usePacientesStore()
const catalogos = useCatalogosStore()
const toast = useToast()

const GRAVIDADES = ['Leve', 'Moderada', 'Grave']
const SEVERIDADE = { Leve: 'warn', Moderada: 'warn', Grave: 'danger' }

const paciente = computed(() => pacientes.atual)
const alergias = computed(() => paciente.value?.alergias ?? [])

const editando = ref(false)
const rascunho = ref([])

function abrir() {
  rascunho.value = clonarDados(alergias.value)
  editando.value = true
}

const adicionar = () => rascunho.value.push({ substancia: '', reacao: '', gravidade: 'Moderada' })
const remover = (i) => rascunho.value.splice(i, 1)

async function salvar() {
  await pacientes.atualizar(paciente.value.id, {
    alergias: rascunho.value.filter((a) => a.substancia?.trim()),
  })
  editando.value = false
  toast.add({ severity: 'success', summary: 'Alergias atualizadas', life: 2000 })
}
</script>

<template>
  <div v-if="paciente" class="ob-stack">
    <Message severity="warn" :closable="false">
      As alergias registradas aqui aparecem em destaque no cabeçalho do prontuário e
      no momento da prescrição de medicamentos.
    </Message>

    <Card>
      <template #title>
        <div class="cab">
          <i class="pi pi-exclamation-triangle" />
          <span class="cab__titulo">Alergias medicamentosas</span>
          <span class="ob-spacer" />
          <Button v-if="!editando" label="Editar" icon="pi pi-pencil" size="small" text @click="abrir" />
        </div>
      </template>

      <template #content>
        <!-- Edição -->
        <div v-if="editando" class="ob-stack">
          <table v-if="rascunho.length" class="alergias">
            <thead>
              <tr><th>Substância</th><th>Reação</th><th>Gravidade</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="(a, i) in rascunho" :key="i">
                <td data-rotulo="Substância">
                  <Select v-model="a.substancia" :options="catalogos.alergias" editable placeholder="Substância" fluid />
                </td>
                <td data-rotulo="Reação">
                  <InputText v-model="a.reacao" placeholder="Ex: urticária" fluid />
                </td>
                <td data-rotulo="Gravidade">
                  <Select v-model="a.gravidade" :options="GRAVIDADES" fluid />
                </td>
                <td>
                  <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Remover alergia" @click="remover(i)" />
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="ob-muted ob-small">Nenhuma alergia registrada.</p>

          <div class="ob-row">
            <Button label="Adicionar alergia" icon="pi pi-plus" size="small" text @click="adicionar" />
            <span class="ob-spacer" />
            <Button label="Cancelar" size="small" text @click="editando = false" />
            <Button label="Salvar" icon="pi pi-check" size="small" :loading="pacientes.salvando" @click="salvar" />
          </div>
        </div>

        <!-- Leitura -->
        <template v-else>
          <EmptyState
            v-if="!alergias.length"
            icone="pi-check-circle"
            titulo="Nenhuma alergia registrada"
            descricao="Nada consta. Registre aqui qualquer reação medicamentosa relatada pelo paciente."
          />
          <ul v-else class="lista">
            <li v-for="a in alergias" :key="a.substancia">
              <Tag :value="a.gravidade" :severity="SEVERIDADE[a.gravidade]" />
              <strong>{{ a.substancia }}</strong>
              <span class="ob-muted">— {{ a.reacao || 'reação não especificada' }}</span>
            </li>
          </ul>
        </template>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.cab { display: flex; align-items: center; gap: 0.5rem; }
.cab > .pi { color: var(--p-red-500); }
.cab__titulo { font-size: 1rem; }

.lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.9375rem; }
.lista li { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.alergias { width: 100%; border-collapse: separate; border-spacing: 0.35rem; }
.alergias th { text-align: left; font-size: 0.75rem; font-weight: 600; color: var(--p-text-muted-color); }
.alergias td:last-child { width: 44px; }

@media (max-width: 760px) {
  .alergias, .alergias tbody, .alergias tr, .alergias td { display: block; width: 100%; }
  .alergias thead { display: none; }
  .alergias tr {
    border: 1px solid var(--p-content-border-color);
    border-radius: var(--ob-radius);
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .alergias td::before {
    content: attr(data-rotulo);
    display: block;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--p-text-muted-color);
    margin-bottom: 0.15rem;
  }
}
</style>

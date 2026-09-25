<script setup>
import { computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Message from 'primevue/message'
import ProgressSpinner from 'primevue/progressspinner'
import PacienteAvatar from '@/components/common/PacienteAvatar.vue'
import DataMaskedText from '@/components/common/DataMaskedText.vue'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { formatarData, idade } from '@/utils/formato.js'

/** Shell do prontuário: identifica o paciente e navega entre os módulos clínicos. */
const props = defineProps({ id: { type: String, required: true } })

const route = useRoute()
const router = useRouter()
const pacientes = usePacientesStore()
const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()

const paciente = computed(() => pacientes.atual)

const abas = [
  { nome: 'prontuario-antecedentes', rotulo: 'Antecedentes', icone: 'pi-book' },
  { nome: 'prontuario-alergias', rotulo: 'Alergias', icone: 'pi-exclamation-triangle' },
  { nome: 'prontuario-anamnese', rotulo: 'Anamnese', icone: 'pi-comment' },
  { nome: 'prontuario-exames', rotulo: 'Exames', icone: 'pi-eye' },
  { nome: 'prontuario-procedimentos', rotulo: 'Procedimentos', icone: 'pi-bolt' },
  { nome: 'prontuario-diagnosticos', rotulo: 'Diagnósticos', icone: 'pi-tag' },
  { nome: 'prontuario-prescricoes', rotulo: 'Prescrições', icone: 'pi-file-edit' },
]

async function carregar(id) {
  await catalogos.carregar()
  await pacientes.carregar(id)
  await prontuario.carregar(id)
}

onMounted(() => carregar(props.id))
watch(() => props.id, (novo) => carregar(novo))

/** Linha de identificação: só os dados realmente preenchidos. */
const identificacao = computed(() => {
  const p = paciente.value
  if (!p) return []
  const anos = idade(p.dataNascimento)
  return [
    anos != null ? `${anos} anos` : null,
    p.sexo,
    p.dataNascimento ? `nascido(a) em ${formatarData(p.dataNascimento)}` : null,
    p.convenio.nome + (p.convenio.plano ? ` (${p.convenio.plano})` : ''),
  ].filter(Boolean)
})

</script>

<template>
  <div v-if="pacientes.carregando && !paciente" class="carregando">
    <ProgressSpinner style="width: 40px" />
  </div>

  <div v-else-if="paciente">
    <!-- Cabeçalho de identificação -->
    <header class="ficha">
      <PacienteAvatar :nome="paciente.nome" tamanho="grande" />

      <div class="ficha__info">
        <h1 class="ficha__nome">
          {{ paciente.nome }}
          <span v-if="paciente.nomeSocial" class="ob-muted ob-small">({{ paciente.nomeSocial }})</span>
        </h1>
        <p class="ficha__meta ob-small ob-muted">
          <span v-for="(item, i) in identificacao" :key="item">
            {{ item }}<span v-if="i < identificacao.length - 1 || paciente.cpf"> ·</span>
          </span>
          <span v-if="paciente.cpf">CPF <DataMaskedText :valor="paciente.cpf" /></span>
        </p>
        <div class="ob-row-wrap ficha__tags">
          <Tag
            v-for="d in paciente.historico.doencasOculares"
            :key="d"
            :value="d"
            severity="secondary"
          />
          <Tag
            v-for="c in paciente.historico.comorbidades"
            :key="c"
            :value="c"
            severity="info"
          />
        </div>
      </div>

      <div class="ficha__acoes">
        <Button
          label="Editar cadastro"
          icon="pi pi-user-edit"
          outlined
          @click="router.push({ name: 'paciente-editar', params: { id: paciente.id } })"
        />
      </div>
    </header>

    <!-- Alergias em destaque permanente (RFCAD03) -->
    <Message v-if="paciente.alergias.length" severity="error" :closable="false" class="alergias">
      <strong>Alergias:</strong>&nbsp;
      <span v-for="(a, i) in paciente.alergias" :key="a.substancia">
        {{ a.substancia }} ({{ a.reacao }} — {{ a.gravidade.toLowerCase() }}){{ i < paciente.alergias.length - 1 ? ' · ' : '' }}
      </span>
    </Message>

    <!-- Navegação entre módulos do prontuário -->
    <nav class="abas ob-no-print">
      <RouterLink
        v-for="a in abas"
        :key="a.nome"
        :to="{ name: a.nome, params: { id: paciente.id } }"
        class="abas__item"
        :class="{ 'abas__item--ativo': route.name === a.nome }"
      >
        <i class="pi" :class="a.icone" />
        {{ a.rotulo }}
      </RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<style scoped>
.carregando { display: grid; place-items: center; padding: 4rem; }

.ficha {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  padding: 1rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
}
.ficha__info { flex: 1; min-width: 240px; }
.ficha__nome { font-size: 1.25rem; }
.ficha__meta { margin: 0.2rem 0 0; display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; }
.ficha__tags { margin-top: 0.5rem; }
.ficha__tags :deep(.p-tag) { font-size: 0.7rem; }
.ficha__acoes { display: flex; gap: 0.5rem; flex-wrap: wrap; }

.alergias { margin: 0.75rem 0 0; }

.abas {
  display: flex;
  gap: 0.25rem;
  margin: 1rem 0 1.25rem;
  overflow-x: auto;
  border-bottom: 1px solid var(--p-content-border-color);
}
.abas__item {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  white-space: nowrap;
  padding: 0.55rem 0.85rem;
  border-bottom: 2px solid transparent;
  color: var(--p-text-muted-color);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
}
.abas__item:hover { color: var(--p-text-color); }
.abas__item--ativo {
  color: var(--p-highlight-color);
  border-bottom-color: var(--p-primary-500);
}
</style>

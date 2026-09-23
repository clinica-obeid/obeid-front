<script setup>
import { ref } from 'vue'
import Card from 'primevue/card'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import Checkbox from 'primevue/checkbox'
import { useToast } from 'primevue/usetoast'
import EmptyState from '@/components/common/EmptyState.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { formatarData } from '@/utils/formato.js'

/** Anamnese oftalmológica — RFANA01 (queixa) e RFANA02 (história ocular). */
const props = defineProps({ consultaId: { type: String, default: null } })

const prontuario = useProntuarioStore()
const toast = useToast()

const TEMPOS = ['Menos de 1 semana', '1 a 4 semanas', '1 a 3 meses', '3 a 6 meses', '6 meses a 1 ano', 'Mais de 1 ano']
const TIPOS_OCULOS = ['Para longe', 'Para perto', 'Bifocal', 'Multifocal', 'Não usa']
const TIPOS_LENTES = ['Gelatinosas', 'Rígidas gás-permeáveis', 'Esclerais', 'Não usa']

const vazio = () => ({
  queixaPrincipal: '',
  tempoSintomas: null,
  historiaOcular: {
    cirurgiasPrevias: '',
    usoOculos: false,
    tipoOculos: null,
    usoLentesContato: false,
    tipoLentes: null,
    ultimaTrocaOculos: '',
    traumaOcular: false,
  },
  historiaFamiliar: '',
})

const form = ref(vazio())
const editando = ref(false)
const salvando = ref(false)

async function salvar() {
  if (!form.value.queixaPrincipal.trim()) return
  salvando.value = true
  try {
    await prontuario.salvarAnamnese({
      ...form.value,
      consultaId: props.consultaId,
      responsavelId: 'med-1',
    })
    form.value = vazio()
    editando.value = false
    toast.add({ severity: 'success', summary: 'Anamnese registrada', life: 2500 })
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="ob-stack">
    <div class="barra">
      <span class="ob-muted ob-small">{{ prontuario.anamneses.length }} anamnese(s) registrada(s)</span>
      <span class="ob-spacer" />
      <Button
        v-if="!editando"
        label="Nova anamnese"
        icon="pi pi-plus"
        @click="editando = true"
      />
    </div>

    <Card v-if="editando">
      <template #title>Nova anamnese</template>
      <template #content>
        <div class="form">
          <div class="campo campo--full">
            <label for="queixa">Queixa principal *</label>
            <Textarea
              id="queixa"
              v-model="form.queixaPrincipal"
              rows="2"
              auto-resize
              placeholder="Relato do paciente com as próprias palavras"
              fluid
            />
          </div>
          <div class="campo">
            <label for="tempo">Tempo de sintomas</label>
            <Select id="tempo" v-model="form.tempoSintomas" :options="TEMPOS" placeholder="Selecione" fluid />
          </div>
          <div class="campo campo--full">
            <label for="cirurgias">Cirurgias oculares prévias</label>
            <Textarea id="cirurgias" v-model="form.historiaOcular.cirurgiasPrevias" rows="2" auto-resize fluid
              placeholder="Ex: facectomia com implante de LIO em OD (2019)" />
          </div>

          <div class="campo campo--full ob-row-wrap">
            <span class="ob-row">
              <Checkbox v-model="form.historiaOcular.usoOculos" input-id="usa-oculos" binary />
              <label for="usa-oculos">Usa óculos</label>
            </span>
            <span class="ob-row">
              <Checkbox v-model="form.historiaOcular.usoLentesContato" input-id="usa-lentes" binary />
              <label for="usa-lentes">Usa lentes de contato</label>
            </span>
            <span class="ob-row">
              <Checkbox v-model="form.historiaOcular.traumaOcular" input-id="trauma" binary />
              <label for="trauma">Histórico de trauma ocular</label>
            </span>
          </div>

          <div v-if="form.historiaOcular.usoOculos" class="campo">
            <label for="tipo-oculos">Tipo de óculos</label>
            <Select id="tipo-oculos" v-model="form.historiaOcular.tipoOculos" :options="TIPOS_OCULOS" fluid />
          </div>
          <div v-if="form.historiaOcular.usoOculos" class="campo">
            <label for="ultima-troca">Última troca</label>
            <InputText id="ultima-troca" v-model="form.historiaOcular.ultimaTrocaOculos" placeholder="Ex: 2023" fluid />
          </div>
          <div v-if="form.historiaOcular.usoLentesContato" class="campo">
            <label for="tipo-lentes">Tipo de lentes</label>
            <Select id="tipo-lentes" v-model="form.historiaOcular.tipoLentes" :options="TIPOS_LENTES" fluid />
          </div>

          <div class="campo campo--full">
            <label for="familiar">História familiar</label>
            <Textarea id="familiar" v-model="form.historiaFamiliar" rows="2" auto-resize fluid
              placeholder="Ex: mãe com glaucoma" />
          </div>
        </div>
      </template>
      <template #footer>
        <div class="ob-row">
          <Button label="Cancelar" text @click="editando = false" />
          <Button
            label="Salvar anamnese"
            icon="pi pi-check"
            :loading="salvando"
            :disabled="!form.queixaPrincipal.trim()"
            @click="salvar"
          />
        </div>
      </template>
    </Card>

    <EmptyState
      v-if="!prontuario.anamneses.length && !editando"
      icone="pi-comment"
      titulo="Nenhuma anamnese registrada"
      descricao="Registre a queixa principal e a história ocular do paciente."
    />

    <Card v-for="a in prontuario.anamneses" :key="a.id">
      <template #title>
        <span class="ob-row">
          <i class="pi pi-comment" />
          <span class="registro__titulo">{{ formatarData(a.data) }}</span>
        </span>
      </template>
      <template #content>
        <dl class="registro">
          <dt>Queixa principal</dt>
          <dd>{{ a.queixaPrincipal }}</dd>
          <dt>Tempo de sintomas</dt>
          <dd>{{ a.tempoSintomas ?? '—' }}</dd>
          <dt>Cirurgias prévias</dt>
          <dd>{{ a.historiaOcular?.cirurgiasPrevias || 'Nenhuma' }}</dd>
          <dt>Correção óptica</dt>
          <dd>
            <template v-if="a.historiaOcular?.usoOculos">Óculos {{ a.historiaOcular.tipoOculos }}</template>
            <template v-if="a.historiaOcular?.usoOculos && a.historiaOcular?.usoLentesContato"> · </template>
            <template v-if="a.historiaOcular?.usoLentesContato">Lentes {{ a.historiaOcular.tipoLentes }}</template>
            <template v-if="!a.historiaOcular?.usoOculos && !a.historiaOcular?.usoLentesContato">Não usa</template>
          </dd>
          <dt>História familiar</dt>
          <dd>{{ a.historiaFamiliar || '—' }}</dd>
        </dl>
      </template>
    </Card>
  </div>
</template>

<style scoped>
.barra { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

.form { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem 1rem; }
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.campo.ob-row-wrap { flex-direction: row; gap: 1.25rem; }
.campo.ob-row-wrap label { font-weight: 400; }

.registro__titulo { font-size: 1rem; }
.registro {
  display: grid;
  grid-template-columns: minmax(140px, max-content) 1fr;
  gap: 0.3rem 1rem;
  margin: 0;
  font-size: 0.875rem;
}
.registro dt { color: var(--p-text-muted-color); }
.registro dd { margin: 0; }

@media (max-width: 640px) {
  .registro { grid-template-columns: 1fr; }
  .registro dd { margin-bottom: 0.4rem; }
}
</style>

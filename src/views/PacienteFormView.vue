<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import InputMask from 'primevue/inputmask'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
import MultiSelect from 'primevue/multiselect'
import DatePicker from 'primevue/datepicker'
import Checkbox from 'primevue/checkbox'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import Message from 'primevue/message'
import { useToast } from 'primevue/usetoast'
import PageHeader from '@/components/common/PageHeader.vue'
import { usePacientesStore } from '@/stores/pacientes.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { clonarDados, isoLocal } from '@/utils/formato.js'

/** Cadastro de paciente — RFCAD01 (dados), RFCAD02 (histórico), RFCAD03 (alergias). */
const props = defineProps({ id: { type: String, default: null } })

const router = useRouter()
const toast = useToast()
const pacientes = usePacientesStore()
const catalogos = useCatalogosStore()

const edicao = computed(() => Boolean(props.id))
const aba = ref('0')
const enviado = ref(false)

const vazio = () => ({
  nome: '', nomeSocial: '', cpf: '', rg: '', dataNascimento: null,
  sexo: null, estadoCivil: null, profissao: '',
  contato: { telefone: '', celular: '', email: '' },
  endereco: { cep: '', logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', uf: '' },
  convenio: { nome: 'Particular', plano: '', carteirinha: '', validade: '' },
  emergencia: { nome: '', parentesco: '', telefone: '' },
  historico: { doencasOculares: [], comorbidades: [], cirurgiasOculares: [], medicamentosEmUso: [] },
  alergias: [],
  lgpd: { consentimento: false, dataConsentimento: null, finalidade: 'Assistência à saúde' },
  observacoes: '',
})

const form = ref(vazio())

onMounted(async () => {
  await catalogos.carregar()
  if (!props.id) return
  const paciente = await pacientes.carregar(props.id)
  if (paciente) {
    form.value = structuredClone(paciente)
    if (form.value.dataNascimento) form.value.dataNascimento = new Date(`${form.value.dataNascimento}T00:00:00`)
  }
})

const SEXOS = ['Feminino', 'Masculino', 'Outro', 'Prefiro não informar']
const ESTADOS_CIVIS = ['Solteiro(a)', 'Casado(a)', 'Divorciado(a)', 'Viúvo(a)', 'União estável', 'Não informado']
const PARENTESCOS = ['Cônjuge', 'Filho(a)', 'Pai', 'Mãe', 'Irmão(ã)', 'Amigo(a)', 'Outro']
const GRAVIDADES = ['Leve', 'Moderada', 'Grave']

const nomeInvalido = computed(() => enviado.value && !form.value.nome.trim())
const consentimentoInvalido = computed(() => enviado.value && !form.value.lgpd.consentimento)

function adicionarAlergia() {
  form.value.alergias.push({ substancia: '', reacao: '', gravidade: 'Moderada' })
}

function removerAlergia(i) {
  form.value.alergias.splice(i, 1)
}

/** Converte listas livres digitadas em array (cirurgias, medicamentos). */
function listaTexto(campo) {
  return computed({
    get: () => form.value.historico[campo].join('\n'),
    set: (v) => { form.value.historico[campo] = v.split('\n').map((s) => s.trim()).filter(Boolean) },
  })
}
const cirurgias = listaTexto('cirurgiasOculares')
const medicamentos = listaTexto('medicamentosEmUso')

async function salvar() {
  enviado.value = true
  if (!form.value.nome.trim()) { aba.value = '0'; return }
  if (!form.value.lgpd.consentimento) { aba.value = '3'; return }

  const payload = clonarDados({
    ...form.value,
    dataNascimento: form.value.dataNascimento ? isoLocal(form.value.dataNascimento) : null,
  })
  if (payload.lgpd.consentimento && !payload.lgpd.dataConsentimento) {
    payload.lgpd.dataConsentimento = isoLocal()
  }

  const salvo = edicao.value
    ? await pacientes.atualizar(props.id, payload)
    : await pacientes.criar(payload)

  toast.add({
    severity: 'success',
    summary: edicao.value ? 'Cadastro atualizado' : 'Paciente cadastrado',
    detail: salvo.nome,
    life: 3000,
  })
  router.push({ name: 'prontuario-timeline', params: { id: salvo.id } })
}
</script>

<template>
  <div>
    <PageHeader
      :titulo="edicao ? 'Editar paciente' : 'Novo paciente'"
      icone="pi-user-edit"
      subtitulo="Os campos marcados com * são obrigatórios."
    >
      <template #acoes>
        <Button label="Cancelar" text @click="router.back()" />
        <Button label="Salvar" icon="pi pi-check" :loading="pacientes.salvando" @click="salvar" />
      </template>
    </PageHeader>

    <Tabs v-model:value="aba">
      <TabList>
        <Tab value="0">Dados pessoais</Tab>
        <Tab value="1">Contato e convênio</Tab>
        <Tab value="2">Histórico clínico</Tab>
        <Tab value="3">Alergias e consentimento</Tab>
      </TabList>

      <TabPanels>
        <!-- RFCAD01 — identificação -->
        <TabPanel value="0">
          <div class="form">
            <div class="campo campo--full">
              <label for="nome">Nome completo *</label>
              <InputText id="nome" v-model="form.nome" :invalid="nomeInvalido" fluid />
              <small v-if="nomeInvalido" class="campo__erro">Informe o nome do paciente.</small>
            </div>
            <div class="campo campo--full">
              <label for="nome-social">Nome social</label>
              <InputText id="nome-social" v-model="form.nomeSocial" fluid />
            </div>
            <div class="campo">
              <label for="cpf">CPF</label>
              <InputMask id="cpf" v-model="form.cpf" mask="999.999.999-99" placeholder="000.000.000-00" fluid />
            </div>
            <div class="campo">
              <label for="rg">RG</label>
              <InputText id="rg" v-model="form.rg" fluid />
            </div>
            <div class="campo">
              <label for="nascimento">Data de nascimento</label>
              <DatePicker id="nascimento" v-model="form.dataNascimento" date-format="dd/mm/yy" show-icon fluid />
            </div>
            <div class="campo">
              <label for="sexo">Sexo</label>
              <Select id="sexo" v-model="form.sexo" :options="SEXOS" placeholder="Selecione" fluid />
            </div>
            <div class="campo">
              <label for="estado-civil">Estado civil</label>
              <Select id="estado-civil" v-model="form.estadoCivil" :options="ESTADOS_CIVIS" placeholder="Selecione" fluid />
            </div>
            <div class="campo">
              <label for="profissao">Profissão</label>
              <InputText id="profissao" v-model="form.profissao" fluid />
            </div>
          </div>
        </TabPanel>

        <!-- RFCAD01 — contato, endereço, convênio, emergência -->
        <TabPanel value="1">
          <h3 class="secao">Contato</h3>
          <div class="form">
            <div class="campo">
              <label for="celular">Celular</label>
              <InputMask id="celular" v-model="form.contato.celular" mask="(99) 99999-9999" fluid />
            </div>
            <div class="campo">
              <label for="telefone">Telefone</label>
              <InputMask id="telefone" v-model="form.contato.telefone" mask="(99) 9999-9999" fluid />
            </div>
            <div class="campo campo--full">
              <label for="email">E-mail</label>
              <InputText id="email" v-model="form.contato.email" type="email" fluid />
            </div>
          </div>

          <h3 class="secao">Endereço</h3>
          <div class="form">
            <div class="campo">
              <label for="cep">CEP</label>
              <InputMask id="cep" v-model="form.endereco.cep" mask="99999-999" fluid />
            </div>
            <div class="campo campo--full">
              <label for="logradouro">Logradouro</label>
              <InputText id="logradouro" v-model="form.endereco.logradouro" fluid />
            </div>
            <div class="campo">
              <label for="numero">Número</label>
              <InputText id="numero" v-model="form.endereco.numero" fluid />
            </div>
            <div class="campo">
              <label for="complemento">Complemento</label>
              <InputText id="complemento" v-model="form.endereco.complemento" fluid />
            </div>
            <div class="campo">
              <label for="bairro">Bairro</label>
              <InputText id="bairro" v-model="form.endereco.bairro" fluid />
            </div>
            <div class="campo">
              <label for="cidade">Cidade</label>
              <InputText id="cidade" v-model="form.endereco.cidade" fluid />
            </div>
            <div class="campo">
              <label for="uf">UF</label>
              <InputText id="uf" v-model="form.endereco.uf" maxlength="2" fluid />
            </div>
          </div>

          <h3 class="secao">Convênio</h3>
          <div class="form">
            <div class="campo">
              <label for="convenio">Convênio</label>
              <Select id="convenio" v-model="form.convenio.nome" :options="catalogos.convenios" editable fluid />
            </div>
            <div class="campo">
              <label for="plano">Plano</label>
              <InputText id="plano" v-model="form.convenio.plano" fluid />
            </div>
            <div class="campo">
              <label for="carteirinha">Carteirinha</label>
              <InputText id="carteirinha" v-model="form.convenio.carteirinha" fluid />
            </div>
          </div>

          <h3 class="secao">Contato de emergência</h3>
          <div class="form">
            <div class="campo">
              <label for="emg-nome">Nome</label>
              <InputText id="emg-nome" v-model="form.emergencia.nome" fluid />
            </div>
            <div class="campo">
              <label for="emg-parentesco">Parentesco</label>
              <Select id="emg-parentesco" v-model="form.emergencia.parentesco" :options="PARENTESCOS" fluid />
            </div>
            <div class="campo">
              <label for="emg-telefone">Telefone</label>
              <InputMask id="emg-telefone" v-model="form.emergencia.telefone" mask="(99) 99999-9999" fluid />
            </div>
          </div>
        </TabPanel>

        <!-- RFCAD02 — histórico de doenças oculares e sistêmicas -->
        <TabPanel value="2">
          <div class="form">
            <div class="campo campo--full">
              <label for="doencas-oculares">Histórico de doenças oculares</label>
              <MultiSelect
                id="doencas-oculares"
                v-model="form.historico.doencasOculares"
                :options="catalogos.doencasOculares"
                display="chip"
                filter
                placeholder="Selecione as condições"
                fluid
              />
            </div>
            <div class="campo campo--full">
              <label for="comorbidades">Doenças sistêmicas / comorbidades</label>
              <MultiSelect
                id="comorbidades"
                v-model="form.historico.comorbidades"
                :options="catalogos.comorbidades"
                display="chip"
                filter
                placeholder="Ex: diabetes, hipertensão"
                fluid
              />
            </div>
            <div class="campo campo--full">
              <label for="cirurgias">Cirurgias oculares prévias</label>
              <Textarea id="cirurgias" v-model="cirurgias" rows="3" auto-resize fluid
                placeholder="Uma por linha. Ex: Facectomia com implante de LIO — OD (2019)" />
            </div>
            <div class="campo campo--full">
              <label for="medicamentos">Medicamentos em uso</label>
              <Textarea id="medicamentos" v-model="medicamentos" rows="3" auto-resize fluid
                placeholder="Um por linha. Ex: Latanoprosta 0,005% colírio" />
            </div>
            <div class="campo campo--full">
              <label for="observacoes">Observações</label>
              <Textarea id="observacoes" v-model="form.observacoes" rows="3" auto-resize fluid />
            </div>
          </div>
        </TabPanel>

        <!-- RFCAD03 — alergias medicamentosas + consentimento LGPD -->
        <TabPanel value="3">
          <h3 class="secao">Alergias medicamentosas</h3>
          <Message severity="warn" :closable="false" class="aviso">
            Alergias registradas aqui aparecem em destaque no cabeçalho do prontuário e no momento da prescrição.
          </Message>

          <table v-if="form.alergias.length" class="alergias">
            <thead>
              <tr><th>Substância</th><th>Reação</th><th>Gravidade</th><th /></tr>
            </thead>
            <tbody>
              <tr v-for="(a, i) in form.alergias" :key="i">
                <td>
                  <Select v-model="a.substancia" :options="catalogos.alergias" editable placeholder="Substância" fluid />
                </td>
                <td><InputText v-model="a.reacao" placeholder="Ex: urticária" fluid /></td>
                <td><Select v-model="a.gravidade" :options="GRAVIDADES" fluid /></td>
                <td>
                  <Button icon="pi pi-trash" text rounded severity="danger" aria-label="Remover alergia" @click="removerAlergia(i)" />
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="ob-muted ob-small">Nenhuma alergia registrada.</p>

          <Button label="Adicionar alergia" icon="pi pi-plus" size="small" text @click="adicionarAlergia" />

          <h3 class="secao">Consentimento para tratamento de dados (LGPD)</h3>
          <div class="consentimento" :class="{ 'consentimento--invalido': consentimentoInvalido }">
            <Checkbox v-model="form.lgpd.consentimento" input-id="consentimento" binary />
            <label for="consentimento">
              O paciente foi informado sobre a finalidade do tratamento de seus dados pessoais e de saúde
              — <strong>{{ form.lgpd.finalidade }}</strong> — e forneceu consentimento. *
            </label>
          </div>
          <small v-if="consentimentoInvalido" class="campo__erro">
            O consentimento é obrigatório para concluir o cadastro.
          </small>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<style scoped>
.form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 0.85rem 1rem;
  margin-bottom: 0.5rem;
}
.campo { display: flex; flex-direction: column; gap: 0.3rem; }
.campo--full { grid-column: 1 / -1; }
.campo label { font-size: 0.8125rem; font-weight: 600; }
.campo__erro { color: var(--p-red-500); font-size: 0.75rem; }

.secao {
  font-size: 0.875rem;
  margin: 1.25rem 0 0.75rem;
  padding-bottom: 0.3rem;
  border-bottom: 1px solid var(--p-content-border-color);
  color: var(--p-text-muted-color);
}
.secao:first-child { margin-top: 0; }

.aviso { margin-bottom: 0.75rem; }

.alergias { width: 100%; border-collapse: collapse; margin-bottom: 0.5rem; }
.alergias th {
  text-align: left;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
  padding: 0 0.35rem 0.35rem;
}
.alergias td { padding: 0.2rem 0.35rem; }
.alergias td:last-child { width: 44px; }

.consentimento {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem;
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--ob-radius);
  background: var(--ob-superficie);
  max-width: 70ch;
}
.consentimento--invalido { border-color: var(--p-red-400); }
.consentimento label { font-size: 0.8125rem; line-height: 1.5; }

@media (max-width: 720px) {
  .alergias, .alergias tbody, .alergias tr, .alergias td { display: block; width: 100%; }
  .alergias thead { display: none; }
  .alergias tr { border: 1px solid var(--p-content-border-color); border-radius: var(--ob-radius); padding: 0.5rem; margin-bottom: 0.5rem; }
  .alergias td { padding: 0.2rem 0; }
}
</style>

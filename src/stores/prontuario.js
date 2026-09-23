import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api.js'

/**
 * Estado clínico do paciente aberto no prontuário.
 * As coleções são carregadas sob demanda e invalidadas ao trocar de paciente.
 */
export const useProntuarioStore = defineStore('prontuario', () => {
  const pacienteId = ref(null)
  const timeline = ref([])
  const anamneses = ref([])
  const exames = ref([])
  const procedimentos = ref([])
  const diagnosticos = ref([])
  const prescricoes = ref([])
  const acessos = ref([])
  const carregando = ref(false)

  function limpar() {
    timeline.value = []
    anamneses.value = []
    exames.value = []
    procedimentos.value = []
    diagnosticos.value = []
    prescricoes.value = []
    acessos.value = []
  }

  async function carregar(id, { forcar = false } = {}) {
    if (pacienteId.value === id && !forcar && timeline.value.length) return
    pacienteId.value = id
    limpar()
    carregando.value = true
    try {
      const [tl, ana, exa, pro, dia, pre, acs] = await Promise.all([
        api.prontuario.timeline(id),
        api.anamneses.listByPaciente(id),
        api.exames.listByPaciente(id),
        api.procedimentos.listByPaciente(id),
        api.diagnosticos.listByPaciente(id),
        api.prescricoes.listByPaciente(id),
        api.prontuario.acessos(id),
      ])
      timeline.value = tl
      anamneses.value = ana
      exames.value = exa
      procedimentos.value = pro
      diagnosticos.value = dia
      prescricoes.value = pre
      acessos.value = acs
    } finally {
      carregando.value = false
    }
  }

  /** Cria um registro clínico e recarrega a timeline, mantendo tudo coerente. */
  function criador(recurso, colecao) {
    return async (registro) => {
      const criado = await api[recurso].create({ ...registro, pacienteId: pacienteId.value })
      colecao.value = [criado, ...colecao.value]
      timeline.value = await api.prontuario.timeline(pacienteId.value)
      return criado
    }
  }

  const salvarAnamnese = criador('anamneses', anamneses)
  const salvarExame = criador('exames', exames)
  const salvarProcedimento = criador('procedimentos', procedimentos)
  const salvarDiagnostico = criador('diagnosticos', diagnosticos)
  const salvarPrescricao = criador('prescricoes', prescricoes)

  /**
   * Abre um novo atendimento para o paciente.
   * Sem agenda, a consulta nasce aqui: é o contêiner que agrupa o que for
   * registrado nesta visita e a entrada correspondente na linha do tempo.
   */
  async function iniciarConsulta(dados) {
    const consulta = await api.consultas.create({
      ...dados,
      pacienteId: pacienteId.value,
      data: new Date().toISOString(),
    })
    timeline.value = await api.prontuario.timeline(pacienteId.value)
    return consulta
  }

  /** Encerra o atendimento, congelando o momento em que ele terminou. */
  async function encerrarConsulta(id) {
    const consulta = await api.consultas.update(id, { encerradaEm: new Date().toISOString() })
    timeline.value = await api.prontuario.timeline(pacienteId.value)
    return consulta
  }

  async function removerExame(id) {
    await api.exames.remove(id)
    exames.value = exames.value.filter((e) => e.id !== id)
    timeline.value = await api.prontuario.timeline(pacienteId.value)
  }

  /** Série temporal de um tipo de exame, para os gráficos de acompanhamento. */
  function serie(tipo) {
    return exames.value
      .filter((e) => e.tipo === tipo)
      .sort((a, b) => new Date(a.data) - new Date(b.data))
  }

  /** Último exame registrado de um tipo — usado para pré-preencher receitas. */
  function ultimoExame(tipo) {
    return serie(tipo).at(-1) ?? null
  }

  return {
    pacienteId, timeline, anamneses, exames, procedimentos, diagnosticos,
    prescricoes, acessos, carregando,
    carregar, limpar, serie, ultimoExame, removerExame,
    iniciarConsulta, encerrarConsulta,
    salvarAnamnese, salvarExame, salvarProcedimento, salvarDiagnostico, salvarPrescricao,
  }
})

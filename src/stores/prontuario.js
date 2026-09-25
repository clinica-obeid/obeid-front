import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api.js'

/**
 * Estado clínico do paciente aberto no prontuário.
 *
 * As coleções guardam **todas** as versões de cada registro. Uma correção não
 * substitui nada em memória: ela acrescenta a versão nova e marca a anterior
 * com `corrigidoPorId`. As telas listam `vigentes()` e abrem `versoes()`
 * quando alguém quer ver o que foi corrigido.
 */
export const useProntuarioStore = defineStore('prontuario', () => {
  const pacienteId = ref(null)
  const anamneses = ref([])
  const exames = ref([])
  const procedimentos = ref([])
  const diagnosticos = ref([])
  const prescricoes = ref([])
  const acessos = ref([])
  const carregando = ref(false)

  const COLECOES = { anamneses, exames, procedimentos, diagnosticos, prescricoes }

  function limpar() {
    for (const lista of Object.values(COLECOES)) lista.value = []
    acessos.value = []
  }

  async function carregar(id, { forcar = false } = {}) {
    if (pacienteId.value === id && !forcar && exames.value.length) return
    pacienteId.value = id
    limpar()
    carregando.value = true
    try {
      const [ana, exa, pro, dia, pre, acs] = await Promise.all([
        api.anamneses.listByPaciente(id),
        api.exames.listByPaciente(id),
        api.procedimentos.listByPaciente(id),
        api.diagnosticos.listByPaciente(id),
        api.prescricoes.listByPaciente(id),
        api.prontuario.acessos(id),
      ])
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

  /** Registros em vigor: os que ainda não foram substituídos por uma correção. */
  function vigentes(nome) {
    return (COLECOES[nome]?.value ?? [])
      .filter((r) => !r.corrigidoPorId)
      .sort((a, b) => new Date(b.data) - new Date(a.data))
  }

  /**
   * Versões substituídas de um registro, da mais recente para a mais antiga.
   * Percorre a cadeia `corrigeId` para trás.
   */
  function versoes(nome, registro) {
    const todos = COLECOES[nome]?.value ?? []
    const anteriores = []
    let atual = registro
    while (atual?.corrigeId) {
      atual = todos.find((r) => r.id === atual.corrigeId)
      if (!atual) break
      anteriores.push(atual)
    }
    return anteriores
  }

  /** Cria um registro novo na coleção. */
  function criador(nome) {
    return async (registro) => {
      const criado = await api[nome].create({ ...registro, pacienteId: pacienteId.value })
      COLECOES[nome].value = [criado, ...COLECOES[nome].value]
      return criado
    }
  }

  /**
   * Corrige um registro: grava a versão nova e marca a anterior como
   * substituída, sem remover nada da coleção.
   */
  function corretor(nome) {
    return async (id, registro) => {
      const nova = await api[nome].corrigir(id, registro)
      COLECOES[nome].value = [
        nova,
        ...COLECOES[nome].value.map((r) => (r.id === id ? { ...r, corrigidoPorId: nova.id } : r)),
      ]
      return nova
    }
  }

  const salvarAnamnese = criador('anamneses')
  const salvarExame = criador('exames')
  const salvarProcedimento = criador('procedimentos')
  const salvarDiagnostico = criador('diagnosticos')
  const salvarPrescricao = criador('prescricoes')

  const corrigirAnamnese = corretor('anamneses')
  const corrigirExame = corretor('exames')
  const corrigirProcedimento = corretor('procedimentos')
  const corrigirDiagnostico = corretor('diagnosticos')
  const corrigirPrescricao = corretor('prescricoes')

  /** Último exame em vigor de um tipo — usado para pré-preencher receitas. */
  function ultimoExame(tipo) {
    return vigentes('exames').find((e) => e.tipo === tipo) ?? null
  }

  return {
    pacienteId, anamneses, exames, procedimentos, diagnosticos, prescricoes,
    acessos, carregando,
    carregar, limpar, vigentes, versoes, ultimoExame,
    salvarAnamnese, salvarExame, salvarProcedimento, salvarDiagnostico, salvarPrescricao,
    corrigirAnamnese, corrigirExame, corrigirProcedimento, corrigirDiagnostico, corrigirPrescricao,
  }
})

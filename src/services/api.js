/**
 * Superfície de API consumida pelas stores e telas.
 *
 * É a única camada que os componentes enxergam (RNFTEC04). Hoje ela conversa
 * com o backend simulado; para plugar uma API real basta trocar `http` por um
 * cliente `fetch` — as assinaturas abaixo não mudam.
 */
import { http, ApiError } from './http.js'
import './rotas-mock.js'

export { ApiError }

/** Desembrulha o envelope `{ status, data, meta }` das respostas. */
const dados = (resposta) => resposta.data

const qs = (params) => {
  const limpos = Object.entries(params ?? {}).filter(([, v]) => v != null && v !== '')
  return limpos.length ? `?${new URLSearchParams(limpos)}` : ''
}

export const api = {
  pacientes: {
    list: (filtros) => http.get(`/pacientes${qs(filtros)}`).then(dados),
    get: (id) => http.get(`/pacientes/${id}`).then(dados),
    create: (paciente) => http.post('/pacientes', paciente).then(dados),
    update: (id, alteracoes) => http.patch(`/pacientes/${id}`, alteracoes).then(dados),
  },

  anamneses: recurso('anamneses'),
  exames: recurso('exames'),
  procedimentos: recurso('procedimentos'),
  diagnosticos: recurso('diagnosticos'),
  prescricoes: recurso('prescricoes'),

  prontuario: {
    acessos: (pacienteId) => http.get(`/pacientes/${pacienteId}/acessos`).then(dados),
    registrarAcesso: (acesso) => http.post('/acessos', acesso).then(dados),
  },

  catalogos: {
    todos: () => http.get('/catalogos').then(dados),
    cid10: (busca) => http.get(`/catalogos/cid10${qs({ busca })}`).then(dados),
    medicamentos: (busca) => http.get(`/catalogos/medicamentos${qs({ busca })}`).then(dados),
  },
}

/** Monta as operações padrão de uma coleção clínica vinculada ao paciente. */
function recurso(caminho) {
  return {
    listByPaciente: (pacienteId) => http.get(`/pacientes/${pacienteId}/${caminho}`).then(dados),
    get: (id) => http.get(`/${caminho}/${id}`).then(dados),
    create: (registro) => http.post(`/${caminho}`, registro).then(dados),
    update: (id, alteracoes) => http.patch(`/${caminho}/${id}`, alteracoes).then(dados),
    /** Cria uma versão nova que substitui `id`, preservando a anterior. */
    corrigir: (id, registro) => http.post(`/${caminho}/${id}/correcao`, registro).then(dados),
  }
}

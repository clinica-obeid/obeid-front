/**
 * Rotas do backend simulado.
 *
 * Este arquivo é o único que conhece o formato do banco em memória — é a
 * contrapartida do "servidor". Quando existir uma API real, basta deixar de
 * importá-lo: `api.js` continua igual.
 */
import { rota } from './http.js'
import * as db from '@/mocks/db.js'
import { CID10, MEDICAMENTOS, MEDICOS, PROCEDIMENTOS, CONVENIOS, COMORBIDADES, DOENCAS_OCULARES, ALERGIAS } from '@/mocks/catalogos.js'

const porPaciente = (nome, pacienteId) =>
  db.colecao(nome).filter((r) => r.pacienteId === pacienteId)

const maisRecentePrimeiro = (a, b) => new Date(b.data) - new Date(a.data)

// ---------------------------------------------------------------- pacientes
rota('GET', '/pacientes', ({ query }) => {
  const busca = (query.get('busca') ?? '').trim().toLowerCase()
  let lista = db.colecao('pacientes')
  if (busca) {
    lista = lista.filter(
      (p) =>
        p.nome.toLowerCase().includes(busca) ||
        p.cpf.replace(/\D/g, '').includes(busca.replace(/\D/g, '')) ||
        p.contato.celular.includes(busca),
    )
  }
  return lista.sort((a, b) => a.nome.localeCompare(b.nome))
})

rota('GET', '/pacientes/:id', ({ params }) =>
  db.colecao('pacientes').find((p) => p.id === params.id) ?? null)

rota('POST', '/pacientes', ({ body }) =>
  db.inserir('pacientes', { ...body, id: db.novoId('pac'), criadoEm: new Date().toISOString() }))

rota('PATCH', '/pacientes/:id', ({ params, body }) =>
  db.atualizar('pacientes', params.id, body))

// -------------------------------------------- coleções do prontuário (CRUD)
/** Registra GET por paciente + POST para cada coleção clínica. */
function recursoClinico(caminho, colecao, prefixoId) {
  rota('GET', `/pacientes/:pacienteId/${caminho}`, ({ params }) =>
    porPaciente(colecao, params.pacienteId).sort(maisRecentePrimeiro))

  rota('GET', `/${caminho}/:id`, ({ params }) =>
    db.colecao(colecao).find((r) => r.id === params.id) ?? null)

  rota('POST', `/${caminho}`, ({ body }) =>
    db.inserir(colecao, {
      ...body,
      id: db.novoId(prefixoId),
      data: body.data ?? new Date().toISOString(),
      criadoEm: new Date().toISOString(),
    }))

  rota('PATCH', `/${caminho}/:id`, ({ params, body }) => db.atualizar(colecao, params.id, body))

  /**
   * Correção de um registro.
   *
   * Num prontuário nada se apaga: a correção grava uma versão nova, aponta
   * para a que substitui e marca a anterior como substituída. A data clínica
   * do registro é preservada — só o `criadoEm` marca quando a correção foi
   * feita.
   */
  rota('POST', `/${caminho}/:id/correcao`, ({ params, body }) => {
    const anterior = db.colecao(colecao).find((r) => r.id === params.id)
    if (!anterior) return null

    const nova = db.inserir(colecao, {
      ...anterior,
      ...body,
      id: db.novoId(prefixoId),
      data: anterior.data,
      corrigeId: anterior.id,
      corrigidoPorId: null,
      criadoEm: new Date().toISOString(),
    })
    db.atualizar(colecao, anterior.id, { corrigidoPorId: nova.id })
    return nova
  })
}

recursoClinico('anamneses', 'anamneses', 'ana')
recursoClinico('exames', 'exames', 'exa')
recursoClinico('procedimentos', 'procedimentos', 'pro')
recursoClinico('diagnosticos', 'diagnosticos', 'dia')
recursoClinico('prescricoes', 'prescricoes', 'pre')

// ------------------------------------------------------------ trilha LGPD
rota('GET', '/pacientes/:pacienteId/acessos', ({ params }) =>
  porPaciente('acessos', params.pacienteId).sort(maisRecentePrimeiro))

rota('POST', '/acessos', ({ body }) =>
  db.inserir('acessos', { ...body, id: db.novoId('acs'), data: new Date().toISOString() }))

// ---------------------------------------------------------------- catálogos
rota('GET', '/catalogos', () => ({
  medicos: MEDICOS,
  convenios: CONVENIOS,
  cid10: CID10,
  medicamentos: MEDICAMENTOS,
  procedimentos: PROCEDIMENTOS,
  comorbidades: COMORBIDADES,
  doencasOculares: DOENCAS_OCULARES,
  alergias: ALERGIAS,
}))

rota('GET', '/catalogos/cid10', ({ query }) => {
  const busca = (query.get('busca') ?? '').trim().toLowerCase()
  if (!busca) return CID10.slice(0, 15)
  return CID10.filter(
    (c) => c.codigo.toLowerCase().includes(busca) || c.descricao.toLowerCase().includes(busca),
  )
})

rota('GET', '/catalogos/medicamentos', ({ query }) => {
  const busca = (query.get('busca') ?? '').trim().toLowerCase()
  if (!busca) return MEDICAMENTOS
  return MEDICAMENTOS.filter((m) => m.nome.toLowerCase().includes(busca))
})

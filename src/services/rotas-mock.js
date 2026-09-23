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

/** Dia do calendário local de um timestamp. */
function diaLocal(iso) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

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

// -------------------------------------------------------------- consultas
// A consulta é o atendimento em si: agrupa o que foi registrado no prontuário
// numa mesma visita. Não há agendamento — ela nasce quando o atendimento começa.
rota('GET', '/pacientes/:pacienteId/consultas', ({ params }) =>
  porPaciente('consultas', params.pacienteId).sort(maisRecentePrimeiro))

rota('GET', '/consultas/:id', ({ params }) =>
  db.colecao('consultas').find((c) => c.id === params.id) ?? null)

rota('POST', '/consultas', ({ body }) =>
  db.inserir('consultas', {
    ...body,
    id: db.novoId('con'),
    data: body.data ?? new Date().toISOString(),
    criadoEm: new Date().toISOString(),
  }))

rota('PATCH', '/consultas/:id', ({ params, body }) => db.atualizar('consultas', params.id, body))

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

  rota('DELETE', `/${caminho}/:id`, ({ params }) => ({ removido: db.remover(colecao, params.id) }))
}

recursoClinico('anamneses', 'anamneses', 'ana')
recursoClinico('exames', 'exames', 'exa')
recursoClinico('procedimentos', 'procedimentos', 'pro')
recursoClinico('diagnosticos', 'diagnosticos', 'dia')
recursoClinico('prescricoes', 'prescricoes', 'pre')

// ------------------------------------------------------- trilha LGPD e timeline
rota('GET', '/pacientes/:pacienteId/acessos', ({ params }) =>
  porPaciente('acessos', params.pacienteId).sort(maisRecentePrimeiro))

rota('POST', '/acessos', ({ body }) =>
  db.inserir('acessos', { ...body, id: db.novoId('acs'), data: new Date().toISOString() }))

/**
 * Timeline consolidada do paciente (RFHIS01).
 * O agrupamento por consulta é feito aqui, no "servidor", para que a tela
 * receba os dados prontos — como aconteceria com uma API real.
 */
rota('GET', '/pacientes/:pacienteId/timeline', ({ params }) => {
  const { pacienteId } = params
  const consultas = porPaciente('consultas', pacienteId)
  const exames = porPaciente('exames', pacienteId)
  const procedimentos = porPaciente('procedimentos', pacienteId)
  const diagnosticos = porPaciente('diagnosticos', pacienteId)
  const prescricoes = porPaciente('prescricoes', pacienteId)
  const anamneses = porPaciente('anamneses', pacienteId)

  const grupos = consultas.map((consulta) => ({
    consulta,
    anamnese: anamneses.find((a) => a.consultaId === consulta.id) ?? null,
    exames: exames.filter((e) => e.consultaId === consulta.id),
    procedimentos: procedimentos.filter((p) => p.consultaId === consulta.id),
    diagnosticos: diagnosticos.filter((d) => d.consultaId === consulta.id),
    prescricoes: prescricoes.filter((p) => p.consultaId === consulta.id),
  }))

  // Registros lançados fora de um atendimento (ex: um exame avulso)
  // ainda pertencem ao histórico do paciente — agrupamos por dia.
  const avulsos = {}
  const agrupar = (lista, chave) => {
    for (const registro of lista.filter((r) => !r.consultaId)) {
      const d = diaLocal(registro.data)
      avulsos[d] ??= { exames: [], procedimentos: [], diagnosticos: [], prescricoes: [], anamnese: null }
      if (chave === 'anamnese') avulsos[d].anamnese ??= registro
      else avulsos[d][chave].push(registro)
    }
  }
  agrupar(anamneses, 'anamnese')
  agrupar(exames, 'exames')
  agrupar(procedimentos, 'procedimentos')
  agrupar(diagnosticos, 'diagnosticos')
  agrupar(prescricoes, 'prescricoes')

  for (const [d, conteudo] of Object.entries(avulsos)) {
    grupos.push({
      ...conteudo,
      consulta: {
        id: `avulso-${d}`,
        pacienteId,
        data: `${d}T23:59:00`,
        status: 'finalizado',
        tipo: 'Registro avulso',
        motivo: 'Lançado fora de um atendimento',
        avulso: true,
      },
    })
  }

  return grupos.sort((a, b) => new Date(b.consulta.data) - new Date(a.consulta.data))
})

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

/**
 * "Back fantasma" (RNFTEC03).
 *
 * Simula um cliente HTTP real: latência variável, envelope de resposta,
 * códigos de status e erros. As rotas são resolvidas contra o banco em
 * memória, mas a assinatura é a mesma de um `fetch` — trocar esta camada
 * por chamadas reais não afeta `api.js` nem as stores (RNFTEC04).
 */
import * as db from '@/mocks/db.js'

const LATENCIA_MIN = Number(import.meta.env.VITE_MOCK_LATENCIA_MIN ?? 150)
const LATENCIA_MAX = Number(import.meta.env.VITE_MOCK_LATENCIA_MAX ?? 550)
const TAXA_ERRO = Number(import.meta.env.VITE_MOCK_TAXA_ERRO ?? 0)

export class ApiError extends Error {
  constructor(status, message, detalhes) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.detalhes = detalhes
  }
}

const dormir = (ms) => new Promise((r) => setTimeout(r, ms))
const latencia = () => LATENCIA_MIN + Math.random() * (LATENCIA_MAX - LATENCIA_MIN)

/** Tabela de rotas: cada entrada é [método, padrão, handler]. */
const rotas = []

/**
 * Registra uma rota do backend simulado.
 * @param {string} metodo GET | POST | PATCH | PUT | DELETE
 * @param {string} padrao caminho com parâmetros nomeados, ex: '/pacientes/:id'
 * @param {(ctx: {params: Object, query: URLSearchParams, body: Object}) => *} handler
 */
export function rota(metodo, padrao, handler) {
  const partes = padrao.split('/').filter(Boolean)
  rotas.push({ metodo, partes, handler })
}

function resolver(metodo, caminho) {
  const [semQuery, queryString = ''] = caminho.split('?')
  const partes = semQuery.split('/').filter(Boolean)

  for (const r of rotas) {
    if (r.metodo !== metodo || r.partes.length !== partes.length) continue
    const params = {}
    const casou = r.partes.every((p, i) => {
      if (p.startsWith(':')) {
        params[p.slice(1)] = decodeURIComponent(partes[i])
        return true
      }
      return p === partes[i]
    })
    if (casou) return { handler: r.handler, params, query: new URLSearchParams(queryString) }
  }
  return null
}

/**
 * Serializa o corpo como um cliente HTTP real faria.
 * Além de refletir o comportamento de rede, isso desembrulha os proxies
 * reativos do Vue antes que cheguem à camada de dados.
 */
const serializar = (body) => (body === undefined ? undefined : JSON.parse(JSON.stringify(body)))

async function requisicao(metodo, caminho, body) {
  await dormir(latencia())

  if (TAXA_ERRO > 0 && Math.random() < TAXA_ERRO) {
    throw new ApiError(503, 'Serviço temporariamente indisponível. Tente novamente.')
  }

  const alvo = resolver(metodo, caminho)
  if (!alvo) throw new ApiError(404, `Rota não encontrada: ${metodo} ${caminho}`)

  const resultado = alvo.handler({ params: alvo.params, query: alvo.query, body: serializar(body), db })
  if (resultado === null || resultado === undefined) {
    throw new ApiError(404, 'Registro não encontrado.')
  }

  const status = metodo === 'POST' ? 201 : 200
  return {
    status,
    data: resultado,
    meta: Array.isArray(resultado) ? { total: resultado.length } : {},
  }
}

export const http = {
  get: (caminho) => requisicao('GET', caminho),
  post: (caminho, body) => requisicao('POST', caminho, body),
  put: (caminho, body) => requisicao('PUT', caminho, body),
  patch: (caminho, body) => requisicao('PATCH', caminho, body),
  del: (caminho) => requisicao('DELETE', caminho),
}

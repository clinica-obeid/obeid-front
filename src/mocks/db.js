/**
 * Banco de dados em memória do protótipo.
 *
 * Substitui o banco real. O estado é persistido em localStorage para que a
 * demonstração sobreviva a um reload, e pode ser restaurado ao seed original
 * pelo menu do sistema.
 *
 * Nenhum componente deve importar este módulo: o acesso passa por
 * `services/http.js` -> `services/api.js` (RNFTEC04).
 */
import { criarEstadoInicial } from './seed.js'

const CHAVE = 'obeid.db.v1'

/** @type {Record<string, Array<Object>>} */
let estado = carregar()

function carregar() {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (bruto) return JSON.parse(bruto)
  } catch (e) {
    console.warn('[db] falha ao ler o estado persistido, recriando o seed.', e)
  }
  const inicial = criarEstadoInicial()
  persistir(inicial)
  return inicial
}

function persistir(dados = estado) {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(dados))
  } catch (e) {
    // Modo anônimo ou cota excedida: a demo segue funcionando só em memória.
    console.warn('[db] não foi possível persistir o estado.', e)
  }
}

/** Devolve uma cópia da coleção, para que nada mute o banco por referência. */
export function colecao(nome) {
  return structuredClone(estado[nome] ?? [])
}

export function inserir(nome, registro) {
  estado[nome] = [...(estado[nome] ?? []), registro]
  persistir()
  return structuredClone(registro)
}

export function atualizar(nome, id, alteracoes) {
  const lista = estado[nome] ?? []
  const indice = lista.findIndex((r) => r.id === id)
  if (indice === -1) return null
  lista[indice] = { ...lista[indice], ...alteracoes, atualizadoEm: new Date().toISOString() }
  persistir()
  return structuredClone(lista[indice])
}

export function remover(nome, id) {
  const lista = estado[nome] ?? []
  const indice = lista.findIndex((r) => r.id === id)
  if (indice === -1) return false
  lista.splice(indice, 1)
  persistir()
  return true
}

/** Gera um id no mesmo formato do seed. */
export function novoId(prefixo) {
  return `${prefixo}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

/** Restaura o banco ao estado de demonstração original. */
export function restaurar() {
  estado = criarEstadoInicial()
  persistir()
}

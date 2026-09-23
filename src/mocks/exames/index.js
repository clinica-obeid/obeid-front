/**
 * Registry de tipos de exame (RFEXA17 / RNFTEC05).
 *
 * Cada arquivo neste diretório exporta um `ExameSchema` e é descoberto
 * automaticamente. Adicionar um novo tipo de exame ao sistema significa
 * criar um arquivo aqui — nenhum componente precisa ser alterado.
 *
 * @typedef {Object} ExameCampo
 * @property {string}   key        chave do dado dentro do exame
 * @property {string}   label      rótulo exibido
 * @property {'text'|'textarea'|'number'|'select'|'multiselect'|'date'|'time'|'checkbox'|'repeater'} tipo
 * @property {boolean} [porOlho]   renderiza o campo separadamente para OD e OE
 * @property {string[]} [opcoes]   opções para select/multiselect
 * @property {string}  [sufixo]    unidade exibida ao lado do campo
 * @property {number}  [passo]     incremento para campos numéricos
 * @property {boolean} [sinal]     exibe sinal + para valores positivos
 * @property {string}  [ajuda]     texto auxiliar
 * @property {'full'}  [largura]   ocupa a linha inteira do formulário
 * @property {*}       [padrao]    valor inicial
 * @property {ExameCampo[]} [colunas] colunas de um campo `repeater`
 *
 * @typedef {Object} ExameSchema
 * @property {string}  id
 * @property {string}  nome
 * @property {string}  abrev
 * @property {string}  grupo
 * @property {string}  icone        classe PrimeIcons
 * @property {boolean} porOlho      exame tem lateralidade (RFEXA17)
 * @property {boolean} permiteAnexos (RFEXA18)
 * @property {boolean} [destaque]   aparece nos atalhos rápidos do atendimento
 * @property {string}  descricao
 * @property {(dados: Object) => string} resumo  linha-resumo para a timeline
 * @property {{serie: Function, unidade: string, titulo: string}} [grafico] série temporal comparável
 * @property {ExameCampo[]} campos
 */

const modulos = import.meta.glob('./*.js', { eager: true })

/** @type {ExameSchema[]} */
export const EXAME_REGISTRY = Object.entries(modulos)
  .filter(([caminho]) => !caminho.endsWith('/index.js'))
  .map(([, mod]) => mod.default)
  .filter(Boolean)
  .sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nome.localeCompare(b.nome))

const porId = new Map(EXAME_REGISTRY.map((e) => [e.id, e]))

/** @returns {ExameSchema | undefined} */
export function getExameSchema(id) {
  return porId.get(id)
}

/** Agrupa os tipos de exame por `grupo`, para menus e seletores. */
export function exameGrupos() {
  const grupos = new Map()
  for (const schema of EXAME_REGISTRY) {
    if (!grupos.has(schema.grupo)) grupos.set(schema.grupo, [])
    grupos.get(schema.grupo).push(schema)
  }
  return [...grupos].map(([label, items]) => ({ label, items }))
}

/** Tipos marcados como `destaque` — atalhos do fluxo de atendimento. */
export function exameDestaques() {
  return EXAME_REGISTRY.filter((e) => e.destaque)
}

/**
 * Monta o objeto de dados inicial de um exame a partir do schema,
 * aplicando os valores `padrao` e desdobrando campos `porOlho`.
 */
export function novoExameDados(schema, olho = 'AO') {
  const dados = {}
  const lados = olho === 'AO' ? ['od', 'oe'] : [olho.toLowerCase()]

  for (const campo of schema.campos) {
    if (campo.porOlho && schema.porOlho) {
      for (const lado of lados) {
        dados[lado] ??= {}
        dados[lado][campo.key] = clonePadrao(campo)
      }
    } else {
      dados[campo.key] = clonePadrao(campo)
    }
  }
  return dados
}

function clonePadrao(campo) {
  if (campo.padrao !== undefined) return structuredClone(campo.padrao)
  if (campo.tipo === 'checkbox') return false
  if (campo.tipo === 'multiselect') return []
  if (campo.tipo === 'repeater') return []
  return null
}

/** Descreve um exame salvo usando o `resumo` do seu schema, com fallback seguro. */
export function resumirExame(exame) {
  const schema = porId.get(exame.tipo)
  if (!schema) return 'Exame'
  try {
    return schema.resumo(exame.dados ?? {}) || schema.nome
  } catch {
    return schema.nome
  }
}

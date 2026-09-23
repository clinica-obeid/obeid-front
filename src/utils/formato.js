/** Formatação e mascaramento de dados para exibição. */

/**
 * Converte um valor para Date tratando "YYYY-MM-DD" como data local.
 * Sem isso, o construtor do JS interpreta a data pura como UTC e a exibe
 * um dia antes em fusos negativos, como o brasileiro.
 */
function paraData(valor) {
  if (valor instanceof Date) return valor
  if (typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return new Date(`${valor}T00:00:00`)
  }
  return new Date(valor)
}

const dataFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' })
const horaFmt = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' })
const extensoFmt = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export const formatarData = (iso) => (iso ? dataFmt.format(paraData(iso)) : '—')
export const formatarHora = (iso) => (iso ? horaFmt.format(paraData(iso)) : '—')
export const formatarDataHora = (iso) => (iso ? `${formatarData(iso)} ${formatarHora(iso)}` : '—')
export const formatarExtenso = (iso) => (iso ? extensoFmt.format(paraData(iso)) : '—')

/** Idade em anos a partir da data de nascimento. */
export function idade(dataNascimento) {
  if (!dataNascimento) return null
  const nasc = paraData(dataNascimento)
  const hoje = new Date()
  let anos = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--
  return anos
}

/** Distância em dias de uma data até hoje, em linguagem natural. */
export function humanizarData(iso) {
  if (!iso) return '—'
  const dias = Math.round((paraData(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86_400_000)
  if (dias === 0) return 'hoje'
  if (dias === 1) return 'amanhã'
  if (dias === -1) return 'ontem'
  if (dias < 0) return `há ${Math.abs(dias)} dias`
  return `em ${dias} dias`
}

/**
 * Mascara dados pessoais identificáveis para exibição em listagens (RNFSEG01).
 * O valor completo só é revelado por ação explícita do usuário.
 */
export function mascarar(valor, tipo = 'cpf') {
  if (!valor) return '—'
  if (tipo === 'cpf') return valor.replace(/^(\d{3})\.(\d{3})\.(\d{3})/, '***.***.$3')
  if (tipo === 'telefone') return valor.replace(/\d(?=\d{4})/g, '*')
  if (tipo === 'email') {
    const [nome, dominio] = valor.split('@')
    if (!dominio) return valor
    return `${nome.slice(0, 2)}${'*'.repeat(Math.max(nome.length - 2, 1))}@${dominio}`
  }
  return valor
}

/** Grau com sinal explícito, no formato usado em receitas de óculos. */
export function formatarGrau(valor) {
  if (valor == null || valor === '') return '—'
  const n = Number(valor)
  return `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n).toFixed(2)}`
}

export const iniciais = (nome = '') =>
  nome.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase()

export const OLHOS = [
  { value: 'OD', label: 'Olho direito (OD)' },
  { value: 'OE', label: 'Olho esquerdo (OE)' },
  { value: 'AO', label: 'Ambos os olhos (AO)' },
]

/**
 * Data local no formato YYYY-MM-DD.
 * `toISOString()` converte para UTC e pode devolver o dia anterior no Brasil.
 */
export function isoLocal(data = new Date()) {
  const d = data instanceof Date ? data : paraData(data)
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

/**
 * Cópia profunda segura para dados vindos de refs do Vue.
 * `structuredClone` falha ao receber um proxy reativo, então usamos a mesma
 * serialização que a camada HTTP aplicaria.
 */
export const clonarDados = (valor) => JSON.parse(JSON.stringify(valor))

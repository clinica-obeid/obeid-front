/**
 * Campos disponíveis na anamnese oftalmológica (RFANA01–02).
 *
 * Este catálogo lista tudo que pode ser perguntado; o formulário exibe todas as
 * perguntas e grava só as respondidas. Os descritores seguem o mesmo formato
 * dos schemas de exame, então `components/exames/CampoInput.vue` os renderiza
 * sem alteração.
 *
 * Acrescentar uma pergunta ao sistema é acrescentar um objeto aqui.
 */

const TEMPOS = [
  'Menos de 1 semana',
  '1 a 4 semanas',
  '1 a 3 meses',
  '3 a 6 meses',
  '6 meses a 1 ano',
  'Mais de 1 ano',
]
const TIPOS_OCULOS = ['Para longe', 'Para perto', 'Bifocal', 'Multifocal', 'Não usa']
const TIPOS_LENTES = ['Gelatinosas', 'Rígidas gás-permeáveis', 'Esclerais', 'Não usa']

/** @type {Array<import('./exames/index.js').ExameCampo & {grupo: string, fixo?: boolean}>} */
export const ANAMNESE_CAMPOS = [
  {
    key: 'queixaPrincipal',
    label: 'Queixa principal',
    tipo: 'textarea',
    grupo: 'Queixa',
    largura: 'full',
    fixo: true,
    placeholder: 'Relato do paciente com as próprias palavras',
  },
  { key: 'tempoSintomas', label: 'Tempo de sintomas', tipo: 'select', opcoes: TEMPOS, grupo: 'Queixa' },
  {
    key: 'historiaDoencaAtual',
    label: 'História da doença atual',
    tipo: 'textarea',
    grupo: 'Queixa',
    largura: 'full',
  },

  {
    key: 'cirurgiasPrevias',
    label: 'Cirurgias oculares prévias',
    tipo: 'textarea',
    grupo: 'História ocular',
    largura: 'full',
    placeholder: 'Ex: facectomia com implante de LIO em OD (2019)',
  },
  { key: 'usoOculos', label: 'Usa óculos', tipo: 'checkbox', grupo: 'História ocular' },
  { key: 'tipoOculos', label: 'Tipo de óculos', tipo: 'select', opcoes: TIPOS_OCULOS, grupo: 'História ocular' },
  { key: 'ultimaTrocaOculos', label: 'Última troca de óculos', tipo: 'text', grupo: 'História ocular', placeholder: 'Ex: 2023' },
  { key: 'usoLentesContato', label: 'Usa lentes de contato', tipo: 'checkbox', grupo: 'História ocular' },
  { key: 'tipoLentes', label: 'Tipo de lentes', tipo: 'select', opcoes: TIPOS_LENTES, grupo: 'História ocular' },
  { key: 'traumaOcular', label: 'Histórico de trauma ocular', tipo: 'checkbox', grupo: 'História ocular' },

  {
    key: 'historiaFamiliar',
    label: 'História familiar',
    tipo: 'textarea',
    grupo: 'Antecedentes',
    largura: 'full',
    placeholder: 'Ex: mãe com glaucoma',
  },
  {
    key: 'medicamentosRelatados',
    label: 'Medicamentos relatados pelo paciente',
    tipo: 'textarea',
    grupo: 'Antecedentes',
    largura: 'full',
  },
  {
    key: 'habitos',
    label: 'Hábitos (tabagismo, uso de telas, leitura)',
    tipo: 'textarea',
    grupo: 'Antecedentes',
    largura: 'full',
  },
]

/** Todas as chaves do catálogo, na ordem em que as perguntas são exibidas. */
export const ANAMNESE_TODOS = ANAMNESE_CAMPOS.map((c) => c.key)

const porChave = new Map(ANAMNESE_CAMPOS.map((c) => [c.key, c]))

export const getAnamneseCampo = (key) => porChave.get(key)

/**
 * Um campo só é gravado se tiver conteúdo.
 * Caixa de seleção desmarcada conta como vazia: `false` é o valor inicial de
 * quem nem olhou para a pergunta, não uma negativa registrada.
 */
export function anamnesePreenchido(campo, valor) {
  if (valor == null) return false
  if (campo?.tipo === 'checkbox') return valor === true
  if (Array.isArray(valor)) return valor.length > 0
  return String(valor).trim() !== ''
}

/**
 * Reduz um formulário ao que foi de fato preenchido, na ordem do catálogo.
 * @returns {{campos: string[], dados: Object}}
 */
export function somenteAnamnesePreenchidos(dados, chaves = ANAMNESE_TODOS) {
  const usados = ANAMNESE_CAMPOS.filter(
    (c) => chaves.includes(c.key) && anamnesePreenchido(c, dados[c.key]),
  )
  return {
    campos: usados.map((c) => c.key),
    dados: Object.fromEntries(usados.map((c) => [c.key, dados[c.key]])),
  }
}

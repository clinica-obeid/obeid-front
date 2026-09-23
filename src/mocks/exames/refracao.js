/**
 * RFEXA02 — Refração (esfera, cilindro, eixo).
 * @type {import('./index.js').ExameSchema}
 */
const grau = (v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))

export default {
  id: 'refracao',
  nome: 'Refração',
  abrev: 'REF',
  grupo: 'Medidas básicas',
  icone: 'pi-sliders-h',
  porOlho: true,
  permiteAnexos: false,
  descricao: 'Refração estática/dinâmica com esfera, cilindro, eixo e adição.',
  resumo: (d) => {
    const olho = (o) =>
      o?.esfera == null ? '—' : `${grau(o.esfera)} ${grau(o.cilindro ?? 0)} × ${o.eixo ?? 0}°`
    return `OD ${olho(d.od)} · OE ${olho(d.oe)}`
  },
  campos: [
    {
      key: 'tipo',
      label: 'Tipo de refração',
      tipo: 'select',
      opcoes: ['Estática', 'Dinâmica', 'Sob cicloplegia', 'Autorrefração'],
      padrao: 'Estática',
    },
    { key: 'esfera', label: 'Esfera', tipo: 'number', porOlho: true, passo: 0.25, sufixo: 'D', sinal: true },
    { key: 'cilindro', label: 'Cilindro', tipo: 'number', porOlho: true, passo: 0.25, sufixo: 'D', sinal: true },
    { key: 'eixo', label: 'Eixo', tipo: 'number', porOlho: true, passo: 1, min: 0, max: 180, sufixo: '°' },
    { key: 'adicao', label: 'Adição', tipo: 'number', porOlho: true, passo: 0.25, sufixo: 'D' },
    { key: 'dp', label: 'Distância pupilar', tipo: 'number', sufixo: 'mm', passo: 0.5 },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

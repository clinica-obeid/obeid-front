/**
 * RFEXA07 — Gonioscopia (ângulo iridocorneano).
 * @type {import('./index.js').ExameSchema}
 */
const SHAFFER = ['Grau 0 (fechado)', 'Grau I', 'Grau II', 'Grau III', 'Grau IV (aberto)']

export default {
  id: 'gonioscopia',
  nome: 'Gonioscopia',
  abrev: 'GON',
  grupo: 'Segmento anterior',
  icone: 'pi-compass',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Classificação do ângulo da câmara anterior por quadrante (Shaffer).',
  resumo: (d) => `Ângulo OD ${d.od?.superior || '—'} · OE ${d.oe?.superior || '—'}`,
  campos: [
    { key: 'superior', label: 'Quadrante superior', tipo: 'select', opcoes: SHAFFER, porOlho: true },
    { key: 'inferior', label: 'Quadrante inferior', tipo: 'select', opcoes: SHAFFER, porOlho: true },
    { key: 'nasal', label: 'Quadrante nasal', tipo: 'select', opcoes: SHAFFER, porOlho: true },
    { key: 'temporal', label: 'Quadrante temporal', tipo: 'select', opcoes: SHAFFER, porOlho: true },
    { key: 'pigmentacao', label: 'Pigmentação trabecular', tipo: 'select', opcoes: ['0', '1+', '2+', '3+', '4+'], porOlho: true },
    { key: 'sinequias', label: 'Sinéquias anteriores periféricas', tipo: 'checkbox', porOlho: true },
    { key: 'lente', label: 'Lente utilizada', tipo: 'select', opcoes: ['Goldmann 3 espelhos', 'Zeiss 4 espelhos', 'Sussman'] },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

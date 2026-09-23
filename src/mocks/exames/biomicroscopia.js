/**
 * RFEXA04 — Biomicroscopia (segmento anterior).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'biomicroscopia',
  nome: 'Biomicroscopia',
  abrev: 'BMC',
  grupo: 'Segmento anterior',
  icone: 'pi-search',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Exame do segmento anterior à lâmpada de fenda.',
  resumo: (d) => d.od?.cristalino || d.oe?.cristalino || 'Biomicroscopia registrada',
  campos: [
    { key: 'palpebras', label: 'Pálpebras e cílios', tipo: 'textarea', porOlho: true, padrao: 'Sem alterações' },
    { key: 'conjuntiva', label: 'Conjuntiva', tipo: 'textarea', porOlho: true, padrao: 'Sem hiperemia' },
    { key: 'cornea', label: 'Córnea', tipo: 'textarea', porOlho: true, padrao: 'Transparente' },
    { key: 'camaraAnterior', label: 'Câmara anterior', tipo: 'textarea', porOlho: true, padrao: 'Formada, sem células' },
    { key: 'iris', label: 'Íris', tipo: 'textarea', porOlho: true, padrao: 'Trófica' },
    { key: 'cristalino', label: 'Cristalino', tipo: 'textarea', porOlho: true, padrao: 'Transparente' },
    {
      key: 'classificacaoCatarata',
      label: 'Catarata (LOCS III)',
      tipo: 'select',
      porOlho: true,
      opcoes: ['Ausente', 'NO1/NC1', 'NO2/NC2', 'NO3/NC3', 'NO4/NC4', 'Cortical', 'Subcapsular posterior'],
    },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

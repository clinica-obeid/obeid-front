/**
 * RFEXA08 — Mapeamento de retina (inclui modalidade RN).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'mapeamento-retina',
  nome: 'Mapeamento de Retina',
  abrev: 'MR',
  grupo: 'Segmento posterior',
  icone: 'pi-map',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Mapeamento de retina sob midríase, incluindo a modalidade RN (retina neonatal).',
  resumo: (d) => `Mapeamento ${d.modalidade || 'convencional'}`,
  campos: [
    {
      key: 'modalidade',
      label: 'Modalidade',
      tipo: 'select',
      opcoes: ['Convencional', 'RN (retina neonatal)', 'Sob sedação'],
      padrao: 'Convencional',
    },
    { key: 'poloPosterior', label: 'Polo posterior', tipo: 'textarea', porOlho: true, padrao: 'Sem alterações' },
    { key: 'periferia', label: 'Periferia retiniana', tipo: 'textarea', porOlho: true, padrao: 'Aplicada, sem roturas ou degenerações' },
    { key: 'roturas', label: 'Roturas / degenerações', tipo: 'textarea', porOlho: true },
    {
      key: 'zonaROP',
      label: 'Zona / estágio (ROP)',
      tipo: 'select',
      porOlho: true,
      opcoes: ['Não aplicável', 'Zona I', 'Zona II', 'Zona III', 'Estágio 1', 'Estágio 2', 'Estágio 3', 'Doença plus'],
      ajuda: 'Preencher apenas na modalidade RN.',
    },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

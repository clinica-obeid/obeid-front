/**
 * RFEXA12 — Ultrassom do globo ocular.
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'ultrassom-ocular',
  nome: 'Ultrassom Ocular',
  abrev: 'USG',
  grupo: 'Imagem',
  icone: 'pi-wave-pulse',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Ultrassonografia do globo ocular em modo A e/ou B.',
  resumo: (d) => `Ultrassom modo ${d.modo || 'B'}`,
  campos: [
    { key: 'modo', label: 'Modo', tipo: 'select', opcoes: ['A', 'B', 'A + B'], padrao: 'B' },
    { key: 'indicacao', label: 'Indicação', tipo: 'text', largura: 'full', placeholder: 'Ex: opacidade de meios' },
    { key: 'vitreo', label: 'Vítreo', tipo: 'textarea', porOlho: true, padrao: 'Acústico, sem opacidades' },
    { key: 'retina', label: 'Retina / coroide', tipo: 'textarea', porOlho: true, padrao: 'Aplicada' },
    { key: 'comprimentoAxial', label: 'Comprimento axial', tipo: 'number', porOlho: true, sufixo: 'mm', passo: 0.01 },
    { key: 'achados', label: 'Achados', tipo: 'textarea', porOlho: true },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

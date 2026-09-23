/**
 * RFEXA10 — Retinografia (simples e grande angular).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'retinografia',
  nome: 'Retinografia',
  abrev: 'RTG',
  grupo: 'Imagem',
  icone: 'pi-camera',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Documentação fotográfica do fundo de olho.',
  resumo: (d) => `Retinografia ${d.modalidade || 'simples'}`,
  campos: [
    {
      key: 'modalidade',
      label: 'Modalidade',
      tipo: 'select',
      opcoes: ['Simples (45°)', 'Grande angular (200°)', 'Aúrea / colorida', 'Autofluorescência'],
      padrao: 'Simples (45°)',
    },
    { key: 'midriase', label: 'Sob midríase', tipo: 'checkbox', padrao: true },
    { key: 'qualidade', label: 'Qualidade da imagem', tipo: 'select', opcoes: ['Boa', 'Regular', 'Ruim'], padrao: 'Boa', porOlho: true },
    { key: 'achados', label: 'Achados', tipo: 'textarea', porOlho: true },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

/**
 * RFEXA15 — Campo visual computadorizado (protocolos 24-2 e 10-2).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'campo-visual',
  nome: 'Campo Visual',
  abrev: 'CV',
  grupo: 'Funcional',
  icone: 'pi-th-large',
  porOlho: true,
  permiteAnexos: true,
  destaque: true,
  descricao: 'Perimetria automatizada para avaliação do campo visual.',
  resumo: (d) => `${d.protocolo || '24-2'} · MD OD ${d.od?.md ?? '—'} / OE ${d.oe?.md ?? '—'} dB`,
  grafico: { serie: (d) => ({ od: d.od?.md, oe: d.oe?.md }), unidade: 'dB', titulo: 'Desvio médio (MD)' },
  campos: [
    { key: 'protocolo', label: 'Protocolo', tipo: 'select', opcoes: ['24-2', '10-2', '30-2', '24-2C'], padrao: '24-2' },
    { key: 'estrategia', label: 'Estratégia', tipo: 'select', opcoes: ['SITA Standard', 'SITA Fast', 'SITA Faster', 'Full Threshold'], padrao: 'SITA Standard' },
    { key: 'md', label: 'Desvio médio (MD)', tipo: 'number', porOlho: true, sufixo: 'dB', passo: 0.01, sinal: true },
    { key: 'psd', label: 'Desvio padrão (PSD)', tipo: 'number', porOlho: true, sufixo: 'dB', passo: 0.01 },
    { key: 'vfi', label: 'Índice de campo visual (VFI)', tipo: 'number', porOlho: true, sufixo: '%' },
    { key: 'ght', label: 'Teste de hemicampo (GHT)', tipo: 'select', porOlho: true, opcoes: ['Dentro dos limites normais', 'Limítrofe', 'Fora dos limites normais', 'Redução da sensibilidade geral'] },
    { key: 'confiabilidade', label: 'Confiabilidade', tipo: 'select', porOlho: true, opcoes: ['Boa', 'Regular', 'Baixa'], padrao: 'Boa' },
    { key: 'achados', label: 'Achados', tipo: 'textarea', porOlho: true, placeholder: 'Ex: escotoma arqueado superior' },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

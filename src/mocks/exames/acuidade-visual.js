/**
 * RFEXA01 — Acuidade visual (com/sem correção, por olho).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'acuidade-visual',
  nome: 'Acuidade Visual',
  abrev: 'AV',
  grupo: 'Medidas básicas',
  icone: 'pi-eye',
  porOlho: true,
  permiteAnexos: false,
  descricao: 'Medida da acuidade visual sem correção, com correção e com pinhole.',
  resumo: (d) =>
    `AVCC OD ${d.od?.comCorrecao || '—'} · OE ${d.oe?.comCorrecao || '—'}`,
  campos: [
    {
      key: 'notacao',
      label: 'Notação',
      tipo: 'select',
      opcoes: ['Snellen (20/x)', 'Snellen (métrica)', 'LogMAR', 'Decimal'],
      padrao: 'Snellen (20/x)',
    },
    { key: 'semCorrecao', label: 'Sem correção (AVSC)', tipo: 'text', porOlho: true, placeholder: '20/40' },
    { key: 'comCorrecao', label: 'Com correção (AVCC)', tipo: 'text', porOlho: true, placeholder: '20/20' },
    { key: 'pinhole', label: 'Pinhole', tipo: 'text', porOlho: true, placeholder: '20/25' },
    {
      key: 'visaoProxima',
      label: 'Visão de perto (Jaeger)',
      tipo: 'select',
      porOlho: true,
      opcoes: ['J1', 'J2', 'J3', 'J4', 'J5', 'J6', 'J7', 'J8', 'J9', 'J10'],
    },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

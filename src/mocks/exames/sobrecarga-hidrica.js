/**
 * RFEXA09 — Teste de sobrecarga hídrica.
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'sobrecarga-hidrica',
  nome: 'Teste de Sobrecarga Hídrica',
  abrev: 'TSH',
  grupo: 'Pressão',
  icone: 'pi-percentage',
  porOlho: false,
  permiteAnexos: false,
  descricao: 'Avaliação do pico pressórico após ingestão hídrica de 1000 ml.',
  resumo: (d) => {
    const vals = (d.medicoes || []).flatMap((m) => [m.od, m.oe]).filter((v) => v != null)
    if (!vals.length) return 'Teste de sobrecarga hídrica'
    const pico = Math.max(...vals)
    const basal = d.medicoes?.[0]
    const base = Math.max(basal?.od ?? 0, basal?.oe ?? 0)
    return `Pico ${pico} mmHg · elevação ${pico - base} mmHg`
  },
  campos: [
    { key: 'volumeIngerido', label: 'Volume ingerido', tipo: 'number', sufixo: 'ml', padrao: 1000, passo: 100 },
    {
      key: 'medicoes',
      label: 'Medições',
      tipo: 'repeater',
      rotuloItem: 'Medição',
      largura: 'full',
      padrao: [
        { momento: 'Basal', od: null, oe: null },
        { momento: '15 min', od: null, oe: null },
        { momento: '30 min', od: null, oe: null },
        { momento: '45 min', od: null, oe: null },
      ],
      colunas: [
        { key: 'momento', label: 'Momento', tipo: 'text' },
        { key: 'od', label: 'PIO OD', tipo: 'number', sufixo: 'mmHg' },
        { key: 'oe', label: 'PIO OE', tipo: 'number', sufixo: 'mmHg' },
      ],
    },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

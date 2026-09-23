/**
 * RFEXA06 — Curva tensional diária (série de PIO ao longo do dia).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'curva-tensional',
  nome: 'Curva Tensional Diária',
  abrev: 'CTD',
  grupo: 'Pressão',
  icone: 'pi-chart-line',
  porOlho: false,
  permiteAnexos: false,
  destaque: true,
  descricao: 'Série de medições de PIO ao longo do dia para avaliar pico e flutuação pressórica.',
  resumo: (d) => {
    const vals = (d.medicoes || []).flatMap((m) => [m.od, m.oe]).filter((v) => v != null)
    if (!vals.length) return 'Curva tensional sem medições'
    const pico = Math.max(...vals)
    return `${d.medicoes.length} medições · pico ${pico} mmHg · variação ${pico - Math.min(...vals)} mmHg`
  },
  campos: [
    {
      key: 'medicoes',
      label: 'Medições ao longo do dia',
      tipo: 'repeater',
      rotuloItem: 'Medição',
      largura: 'full',
      padrao: [
        { hora: '08:00', od: null, oe: null },
        { hora: '11:00', od: null, oe: null },
        { hora: '14:00', od: null, oe: null },
        { hora: '17:00', od: null, oe: null },
      ],
      colunas: [
        { key: 'hora', label: 'Hora', tipo: 'time' },
        { key: 'od', label: 'PIO OD', tipo: 'number', sufixo: 'mmHg' },
        { key: 'oe', label: 'PIO OE', tipo: 'number', sufixo: 'mmHg' },
      ],
    },
    {
      key: 'metodo',
      label: 'Método',
      tipo: 'select',
      opcoes: ['Goldmann (aplanação)', 'Sopro (não contato)', 'iCare (rebote)'],
      padrao: 'Goldmann (aplanação)',
    },
    { key: 'emUsoMedicacao', label: 'Em uso de hipotensor ocular', tipo: 'checkbox' },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

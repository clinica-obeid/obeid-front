/**
 * RFEXA03 — Tonometria (pressão intraocular).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'tonometria',
  nome: 'Tonometria (PIO)',
  abrev: 'PIO',
  grupo: 'Pressão',
  icone: 'pi-gauge',
  porOlho: true,
  permiteAnexos: false,
  destaque: true,
  descricao: 'Aferição da pressão intraocular.',
  resumo: (d) => `PIO OD ${d.od?.pio ?? '—'} / OE ${d.oe?.pio ?? '—'} mmHg`,
  campos: [
    { key: 'pio', label: 'PIO', tipo: 'number', porOlho: true, sufixo: 'mmHg', passo: 1, min: 0, max: 80 },
    {
      key: 'metodo',
      label: 'Método',
      tipo: 'select',
      opcoes: ['Goldmann (aplanação)', 'Sopro (não contato)', 'iCare (rebote)', 'Tono-Pen'],
      padrao: 'Goldmann (aplanação)',
    },
    { key: 'hora', label: 'Horário da medida', tipo: 'time' },
    { key: 'anestesico', label: 'Uso de anestésico tópico', tipo: 'checkbox' },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

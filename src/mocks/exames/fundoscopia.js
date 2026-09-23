/**
 * RFEXA05 — Fundoscopia (segmento posterior).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'fundoscopia',
  nome: 'Fundoscopia',
  abrev: 'FO',
  grupo: 'Segmento posterior',
  icone: 'pi-circle',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Exame do fundo de olho sob midríase.',
  resumo: (d) => `Escavação OD ${d.od?.escavacao ?? '—'} · OE ${d.oe?.escavacao ?? '—'}`,
  campos: [
    { key: 'midriase', label: 'Sob midríase medicamentosa', tipo: 'checkbox', padrao: true },
    { key: 'papila', label: 'Papila / disco óptico', tipo: 'textarea', porOlho: true, padrao: 'Contornos nítidos, coloração normal' },
    { key: 'escavacao', label: 'Relação escavação/disco (E/D)', tipo: 'number', porOlho: true, passo: 0.1, min: 0, max: 1 },
    { key: 'macula', label: 'Mácula', tipo: 'textarea', porOlho: true, padrao: 'Brilho foveal preservado' },
    { key: 'vasos', label: 'Vasos retinianos', tipo: 'textarea', porOlho: true, padrao: 'Calibre e trajeto normais' },
    { key: 'periferia', label: 'Retina periférica', tipo: 'textarea', porOlho: true, padrao: 'Aplicada, sem roturas' },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

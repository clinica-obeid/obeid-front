/**
 * RFEXA16 — Estereofotografia de papila.
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'estereofoto-papila',
  nome: 'Estereofoto de Papila',
  abrev: 'EFP',
  grupo: 'Imagem',
  icone: 'pi-images',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Documentação estereoscópica do disco óptico para acompanhamento do glaucoma.',
  resumo: (d) => `E/D OD ${d.od?.relacaoED ?? '—'} · OE ${d.oe?.relacaoED ?? '—'}`,
  campos: [
    { key: 'relacaoED', label: 'Relação escavação/disco', tipo: 'number', porOlho: true, passo: 0.05, min: 0, max: 1 },
    { key: 'tamanhoDisco', label: 'Tamanho do disco', tipo: 'select', porOlho: true, opcoes: ['Pequeno', 'Médio', 'Grande'] },
    { key: 'rimaNeural', label: 'Rima neural', tipo: 'textarea', porOlho: true, padrao: 'Regra ISNT preservada' },
    { key: 'hemorragiaDisco', label: 'Hemorragia de disco', tipo: 'checkbox', porOlho: true },
    { key: 'atrofiaPeri', label: 'Atrofia peripapilar', tipo: 'select', porOlho: true, opcoes: ['Ausente', 'Zona alfa', 'Zona beta', 'Alfa + beta'] },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

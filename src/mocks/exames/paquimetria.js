/**
 * RFEXA13 — Paquimetria (espessura corneana central).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'paquimetria',
  nome: 'Paquimetria',
  abrev: 'PAQ',
  grupo: 'Segmento anterior',
  icone: 'pi-arrows-h',
  porOlho: true,
  permiteAnexos: false,
  descricao: 'Medida da espessura corneana central, relevante para interpretação da PIO.',
  resumo: (d) => `ECC OD ${d.od?.espessuraCentral ?? '—'} / OE ${d.oe?.espessuraCentral ?? '—'} µm`,
  campos: [
    { key: 'metodo', label: 'Método', tipo: 'select', opcoes: ['Ultrassônica', 'Óptica (Pentacam)', 'OCT de segmento anterior'], padrao: 'Ultrassônica' },
    { key: 'espessuraCentral', label: 'Espessura central (ECC)', tipo: 'number', porOlho: true, sufixo: 'µm' },
    { key: 'pioCorrigida', label: 'PIO corrigida', tipo: 'number', porOlho: true, sufixo: 'mmHg', ajuda: 'PIO ajustada pela espessura corneana.' },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

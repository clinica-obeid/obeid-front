/**
 * RFEXA11 — Tomografia de coerência óptica de mácula (OCT).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'oct-macula',
  nome: 'OCT de Mácula',
  abrev: 'OCT',
  grupo: 'Imagem',
  icone: 'pi-chart-bar',
  porOlho: true,
  permiteAnexos: true,
  destaque: true,
  descricao: 'Tomografia de coerência óptica do segmento posterior.',
  resumo: (d) =>
    `Espessura central OD ${d.od?.espessuraCentral ?? '—'} / OE ${d.oe?.espessuraCentral ?? '—'} µm`,
  campos: [
    { key: 'equipamento', label: 'Equipamento', tipo: 'select', opcoes: ['Spectralis', 'Cirrus', 'Triton', 'Outro'] },
    { key: 'protocolo', label: 'Protocolo', tipo: 'select', opcoes: ['Macular Cube 512x128', 'Radial', 'Posterior Pole', 'RNFL peripapilar'] },
    { key: 'espessuraCentral', label: 'Espessura central', tipo: 'number', porOlho: true, sufixo: 'µm' },
    { key: 'volumeMacular', label: 'Volume macular', tipo: 'number', porOlho: true, sufixo: 'mm³', passo: 0.1 },
    { key: 'rnfl', label: 'RNFL médio', tipo: 'number', porOlho: true, sufixo: 'µm' },
    { key: 'perfilFoveal', label: 'Perfil foveal', tipo: 'select', porOlho: true, opcoes: ['Preservado', 'Alterado', 'Ausente'] },
    { key: 'achados', label: 'Achados', tipo: 'textarea', porOlho: true },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

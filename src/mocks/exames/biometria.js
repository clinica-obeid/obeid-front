/**
 * RFEXA14 — Biometria ocular (cálculo de lente intraocular).
 * @type {import('./index.js').ExameSchema}
 */
export default {
  id: 'biometria',
  nome: 'Biometria',
  abrev: 'BIO',
  grupo: 'Imagem',
  icone: 'pi-calculator',
  porOlho: true,
  permiteAnexos: true,
  descricao: 'Biometria óptica com cálculo da lente intraocular para cirurgia de catarata.',
  resumo: (d) => `AL OD ${d.od?.comprimentoAxial ?? '—'} / OE ${d.oe?.comprimentoAxial ?? '—'} mm`,
  campos: [
    { key: 'metodo', label: 'Método', tipo: 'select', opcoes: ['Óptica (IOL Master)', 'Óptica (Lenstar)', 'Ultrassônica (imersão)'], padrao: 'Óptica (IOL Master)' },
    { key: 'comprimentoAxial', label: 'Comprimento axial (AL)', tipo: 'number', porOlho: true, sufixo: 'mm', passo: 0.01 },
    { key: 'k1', label: 'K1', tipo: 'number', porOlho: true, sufixo: 'D', passo: 0.01 },
    { key: 'k2', label: 'K2', tipo: 'number', porOlho: true, sufixo: 'D', passo: 0.01 },
    { key: 'acd', label: 'Profundidade da câmara anterior (ACD)', tipo: 'number', porOlho: true, sufixo: 'mm', passo: 0.01 },
    { key: 'formula', label: 'Fórmula de cálculo', tipo: 'select', opcoes: ['SRK/T', 'Barrett Universal II', 'Haigis', 'Hoffer Q', 'Holladay 2'], padrao: 'Barrett Universal II' },
    { key: 'lioCalculada', label: 'LIO calculada', tipo: 'number', porOlho: true, sufixo: 'D', passo: 0.5 },
    { key: 'refracaoAlvo', label: 'Refração alvo', tipo: 'number', porOlho: true, sufixo: 'D', passo: 0.25, sinal: true },
    { key: 'observacoes', label: 'Observações', tipo: 'textarea', largura: 'full' },
  ],
}

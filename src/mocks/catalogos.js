/** Catálogos de apoio do protótipo (seriam tabelas de domínio no backend). */

export const MEDICOS = [
  { id: 'med-1', nome: 'Dra. Helena Marques', crm: 'CRM-SP 118.402', especialidade: 'Glaucoma' },
  { id: 'med-2', nome: 'Dr. Rafael Andrade', crm: 'CRM-SP 132.877', especialidade: 'Retina' },
  { id: 'med-3', nome: 'Dra. Camila Nogueira', crm: 'CRM-SP 145.019', especialidade: 'Córnea e catarata' },
  { id: 'med-4', nome: 'Dr. Paulo Ferraz', crm: 'CRM-SP 099.231', especialidade: 'Oftalmopediatria' },
]

export const CONVENIOS = [
  'Particular',
  'Amil',
  'Bradesco Saúde',
  'SulAmérica',
  'Unimed',
  'Porto Seguro Saúde',
  'NotreDame Intermédica',
  'SUS',
]

/** Subset oftalmológico do CID-10 (RFDIA01). */
export const CID10 = [
  { codigo: 'H25.0', descricao: 'Catarata senil incipiente' },
  { codigo: 'H25.1', descricao: 'Catarata senil nuclear' },
  { codigo: 'H25.9', descricao: 'Catarata senil não especificada' },
  { codigo: 'H26.9', descricao: 'Catarata não especificada' },
  { codigo: 'H33.0', descricao: 'Descolamento da retina com defeito retiniano' },
  { codigo: 'H35.0', descricao: 'Retinopatia de fundo e alterações vasculares' },
  { codigo: 'H35.3', descricao: 'Degeneração da mácula e do polo posterior' },
  { codigo: 'H35.8', descricao: 'Outras afecções especificadas da retina' },
  { codigo: 'H36.0', descricao: 'Retinopatia diabética' },
  { codigo: 'H40.0', descricao: 'Suspeita de glaucoma / hipertensão ocular' },
  { codigo: 'H40.1', descricao: 'Glaucoma primário de ângulo aberto' },
  { codigo: 'H40.2', descricao: 'Glaucoma primário de ângulo fechado' },
  { codigo: 'H40.5', descricao: 'Glaucoma secundário a outras afecções oculares' },
  { codigo: 'H40.9', descricao: 'Glaucoma não especificado' },
  { codigo: 'H43.9', descricao: 'Transtorno do vítreo não especificado' },
  { codigo: 'H52.0', descricao: 'Hipermetropia' },
  { codigo: 'H52.1', descricao: 'Miopia' },
  { codigo: 'H52.2', descricao: 'Astigmatismo' },
  { codigo: 'H52.4', descricao: 'Presbiopia' },
  { codigo: 'H10.1', descricao: 'Conjuntivite atópica aguda' },
  { codigo: 'H10.4', descricao: 'Conjuntivite crônica' },
  { codigo: 'H04.1', descricao: 'Outros transtornos da glândula lacrimal (olho seco)' },
  { codigo: 'H16.0', descricao: 'Úlcera de córnea' },
  { codigo: 'H18.6', descricao: 'Ceratocone' },
  { codigo: 'H20.0', descricao: 'Iridociclite aguda e subaguda' },
  { codigo: 'H47.2', descricao: 'Atrofia óptica' },
  { codigo: 'H50.0', descricao: 'Estrabismo convergente concomitante' },
  { codigo: 'H53.4', descricao: 'Defeitos do campo visual' },
]

/** Medicamentos e colírios de uso oftalmológico (RFPRE02). */
export const MEDICAMENTOS = [
  { nome: 'Latanoprosta 0,005% colírio', classe: 'Análogo de prostaglandina', posologia: '1 gota à noite' },
  { nome: 'Timolol 0,5% colírio', classe: 'Betabloqueador', posologia: '1 gota 12/12h' },
  { nome: 'Dorzolamida 2% colírio', classe: 'Inibidor da anidrase carbônica', posologia: '1 gota 8/8h' },
  { nome: 'Brimonidina 0,2% colírio', classe: 'Agonista alfa-2', posologia: '1 gota 12/12h' },
  { nome: 'Dorzolamida + Timolol colírio', classe: 'Associação fixa', posologia: '1 gota 12/12h' },
  { nome: 'Prednisolona 1% colírio', classe: 'Corticoide tópico', posologia: '1 gota 6/6h, com desmame' },
  { nome: 'Moxifloxacino 0,5% colírio', classe: 'Antibiótico tópico', posologia: '1 gota 6/6h por 7 dias' },
  { nome: 'Olopatadina 0,1% colírio', classe: 'Anti-histamínico tópico', posologia: '1 gota 12/12h' },
  { nome: 'Carmelose 0,5% colírio', classe: 'Lubrificante ocular', posologia: '1 gota 4x ao dia' },
  { nome: 'Ciclopentolato 1% colírio', classe: 'Cicloplégico', posologia: 'Uso em consultório' },
  { nome: 'Acetazolamida 250 mg comprimido', classe: 'Inibidor sistêmico', posologia: '1 comprimido 8/8h' },
]

/** Procedimentos terapêuticos (RFPRO01) — deliberadamente separados dos exames. */
export const PROCEDIMENTOS = [
  { id: 'slt', nome: 'Trabeculoplastia seletiva a laser (SLT)', categoria: 'Laser' },
  { id: 'yag-capsulotomia', nome: 'Capsulotomia posterior com YAG laser', categoria: 'Laser' },
  { id: 'yag-iridotomia', nome: 'Iridotomia periférica com YAG laser', categoria: 'Laser' },
  { id: 'fotocoagulacao', nome: 'Fotocoagulação retiniana a laser', categoria: 'Laser' },
  { id: 'panfotocoagulacao', nome: 'Panfotocoagulação retiniana', categoria: 'Laser' },
  { id: 'anti-vegf', nome: 'Injeção intravítrea de anti-VEGF', categoria: 'Injeção' },
  { id: 'implante-dexametasona', nome: 'Implante intravítreo de dexametasona', categoria: 'Injeção' },
  { id: 'crosslinking', nome: 'Crosslinking de colágeno corneano', categoria: 'Córnea' },
  { id: 'corpo-estranho', nome: 'Remoção de corpo estranho corneano', categoria: 'Ambulatorial' },
  { id: 'sondagem-lacrimal', nome: 'Sondagem de vias lacrimais', categoria: 'Ambulatorial' },
]

/** Comorbidades sistêmicas relevantes para o olho (RFCAD02). */
export const COMORBIDADES = [
  'Diabetes mellitus tipo 1',
  'Diabetes mellitus tipo 2',
  'Hipertensão arterial sistêmica',
  'Dislipidemia',
  'Artrite reumatoide',
  'Lúpus eritematoso sistêmico',
  'Doença da tireoide',
  'Enxaqueca',
  'Apneia do sono',
  'Tabagismo',
]

/** Histórico de doenças oculares (RFCAD02). */
export const DOENCAS_OCULARES = [
  'Glaucoma',
  'Catarata',
  'Retinopatia diabética',
  'Degeneração macular relacionada à idade',
  'Ceratocone',
  'Olho seco',
  'Uveíte',
  'Descolamento de retina prévio',
  'Ambliopia',
  'Estrabismo',
]

/** Alergias medicamentosas (RFCAD03). */
export const ALERGIAS = [
  'Sulfa',
  'Penicilina',
  'Dipirona',
  'Anti-inflamatórios não esteroidais',
  'Iodo / contraste',
  'Látex',
  'Cloranfenicol',
  'Anestésicos tópicos',
]

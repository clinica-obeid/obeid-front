/**
 * Geração do estado inicial do "banco" do protótipo.
 *
 * As datas são calculadas a partir de hoje para que a demonstração sempre
 * tenha registros recentes, independentemente de quando for executada.
 *
 * Não existe entidade de consulta: cada registro clínico é um lançamento
 * autônomo, com a sua própria data e o seu responsável — é assim que o
 * sistema é usado, adicionando entradas na tela do paciente.
 */
import { PACIENTES } from './pacientes.js'
import { somenteAnamnesePreenchidos } from './anamnese-campos.js'

const DIA = 86_400_000

const hoje = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/** Data-hora ISO deslocada em `dias`, no horário `hhmm`. */
function em(dias, hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  const d = new Date(hoje().getTime() + dias * DIA)
  d.setHours(h, m, 0, 0)
  return d.toISOString()
}

let seq = 0
const uid = (prefixo) => `${prefixo}-${String(++seq).padStart(4, '0')}`

/** Cria um exame lançado no prontuário do paciente. */
function exame(pacienteId, dias, hora, medicoId, tipo, dados, olho = 'AO', anexos = []) {
  const data = em(dias, hora)
  return {
    id: uid('exa'),
    pacienteId,
    tipo,
    olho,
    data,
    responsavelId: medicoId,
    dados,
    anexos,
    criadoEm: data,
  }
}

const pio = (od, oe, hora = '09:15') => ({
  od: { pio: od },
  oe: { pio: oe },
  metodo: 'Goldmann (aplanação)',
  hora,
  anestesico: true,
  observacoes: null,
})

const av = (od, oe) => ({
  notacao: 'Snellen (20/x)',
  od: { semCorrecao: od.sc, comCorrecao: od.cc, pinhole: null, visaoProxima: od.j ?? null },
  oe: { semCorrecao: oe.sc, comCorrecao: oe.cc, pinhole: null, visaoProxima: oe.j ?? null },
  observacoes: null,
})

const cv = (protocolo, od, oe) => ({
  protocolo,
  estrategia: 'SITA Standard',
  od: { md: od.md, psd: od.psd, vfi: od.vfi, ght: od.ght, confiabilidade: 'Boa', achados: od.achados ?? null },
  oe: { md: oe.md, psd: oe.psd, vfi: oe.vfi, ght: oe.ght, confiabilidade: 'Boa', achados: oe.achados ?? null },
  observacoes: null,
})

const ANEXO_FUNDO = [
  { nome: 'retinografia-od.jpg', tipo: 'image/jpeg', tamanho: 412_338, demo: 'fundo' },
  { nome: 'retinografia-oe.jpg', tipo: 'image/jpeg', tamanho: 398_112, demo: 'fundo' },
]
const ANEXO_OCT = [{ nome: 'oct-macula.pdf', tipo: 'application/pdf', tamanho: 1_204_882, demo: 'oct' }]
const ANEXO_CV = [{ nome: 'campo-visual-24-2.pdf', tipo: 'application/pdf', tamanho: 880_441, demo: 'cv' }]

/** Exames de pac-001 (glaucoma + catarata) — série longa de PIO e campo visual. */
function examesPac001() {
  const e = (dias, hora, tipo, dados, olho, anexos) =>
    exame('pac-001', dias, hora, 'med-1', tipo, dados, olho, anexos)

  return [
    e(-420, '09:00', 'tonometria', pio(18, 19)),
    e(-420, '09:10', 'acuidade-visual', av({ sc: '20/60', cc: '20/30', j: 'J3' }, { sc: '20/70', cc: '20/40', j: 'J4' })),
    e(-420, '09:30', 'campo-visual', cv('24-2',
      { md: -3.12, psd: 2.88, vfi: 94, ght: 'Limítrofe' },
      { md: -4.05, psd: 3.41, vfi: 91, ght: 'Fora dos limites normais', achados: 'Degrau nasal superior' }),
      'AO', ANEXO_CV),
    e(-300, '09:30', 'tonometria', pio(21, 22)),
    e(-300, '09:40', 'paquimetria', {
      metodo: 'Ultrassônica',
      od: { espessuraCentral: 512, pioCorrigida: 22 },
      oe: { espessuraCentral: 505, pioCorrigida: 23 },
      observacoes: 'Córneas finas — PIO real provavelmente subestimada.',
    }),
    e(-180, '10:00', 'tonometria', pio(19, 20)),
    e(-180, '10:20', 'campo-visual', cv('24-2',
      { md: -4.88, psd: 3.62, vfi: 90, ght: 'Fora dos limites normais' },
      { md: -6.71, psd: 5.10, vfi: 84, ght: 'Fora dos limites normais', achados: 'Escotoma arqueado superior' }),
      'AO', ANEXO_CV),
    e(-60, '09:00', 'tonometria', pio(23, 24)),
    e(-60, '09:20', 'gonioscopia', {
      od: { superior: 'Grau III', inferior: 'Grau IV (aberto)', nasal: 'Grau III', temporal: 'Grau IV (aberto)', pigmentacao: '2+', sinequias: false },
      oe: { superior: 'Grau III', inferior: 'Grau III', nasal: 'Grau II', temporal: 'Grau III', pigmentacao: '2+', sinequias: false },
      lente: 'Zeiss 4 espelhos',
      observacoes: null,
    }),
    e(-60, '09:35', 'estereofoto-papila', {
      od: { relacaoED: 0.6, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior', hemorragiaDisco: false, atrofiaPeri: 'Zona beta' },
      oe: { relacaoED: 0.75, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior e superior', hemorragiaDisco: true, atrofiaPeri: 'Alfa + beta' },
      observacoes: 'Hemorragia de disco em OE — sinal de progressão.',
    }, 'AO', ANEXO_FUNDO),
    e(0, '08:00', 'tonometria', pio(17, 18)),
    e(0, '08:10', 'acuidade-visual', av({ sc: '20/60', cc: '20/30', j: 'J3' }, { sc: '20/70', cc: '20/40', j: 'J4' })),
    e(0, '08:30', 'campo-visual', cv('24-2',
      { md: -5.40, psd: 4.02, vfi: 88, ght: 'Fora dos limites normais' },
      { md: -8.24, psd: 6.33, vfi: 79, ght: 'Fora dos limites normais', achados: 'Progressão do escotoma arqueado' }),
      'AO', ANEXO_CV),
    e(0, '08:45', 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Pseudofácico, LIO centrada', classificacaoCatarata: 'Ausente' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Opacidade nuclear moderada', classificacaoCatarata: 'NO3/NC3' },
      observacoes: null,
    }),
  ]
}

/** Exames dos demais pacientes. */
function examesDemais() {
  return [
    // pac-002 — retinopatia diabética
    exame('pac-002', -240, '14:00', 'med-2', 'acuidade-visual', av({ sc: '20/80', cc: '20/50' }, { sc: '20/60', cc: '20/40' })),
    exame('pac-002', -240, '14:20', 'med-2', 'fundoscopia', {
      midriase: true,
      od: { papila: 'Contornos nítidos', escavacao: 0.3, macula: 'Exsudatos duros perifoveais', vasos: 'Microaneurismas em arcada temporal', periferia: 'Hemorragias em chama de vela' },
      oe: { papila: 'Contornos nítidos', escavacao: 0.3, macula: 'Brilho foveal preservado', vasos: 'Microaneurismas esparsos', periferia: 'Aplicada, sem roturas' },
      observacoes: 'Retinopatia diabética não proliferativa moderada em OD.',
    }, 'AO', ANEXO_FUNDO),
    exame('pac-002', -90, '14:30', 'med-2', 'retinografia', {
      modalidade: 'Grande angular (200°)',
      midriase: true,
      od: { qualidade: 'Boa', achados: 'Microaneurismas e exsudatos duros no polo posterior' },
      oe: { qualidade: 'Boa', achados: 'Microaneurismas esparsos' },
      observacoes: null,
    }, 'AO', ANEXO_FUNDO),
    exame('pac-002', -90, '14:50', 'med-2', 'oct-macula', {
      equipamento: 'Spectralis',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 342, volumeMacular: 9.8, rnfl: 96, perfilFoveal: 'Alterado', achados: 'Edema macular cistoide' },
      oe: { espessuraCentral: 268, volumeMacular: 8.4, rnfl: 94, perfilFoveal: 'Preservado', achados: null },
      observacoes: 'Edema macular diabético em OD.',
    }, 'AO', ANEXO_OCT),

    // pac-003 — ceratocone
    exame('pac-003', -150, '11:00', 'med-3', 'acuidade-visual', av({ sc: '20/200', cc: '20/60' }, { sc: '20/400', cc: '20/80' })),
    exame('pac-003', -150, '11:15', 'med-3', 'refracao', {
      tipo: 'Estática',
      od: { esfera: -4.75, cilindro: -3.5, eixo: 15, adicao: null },
      oe: { esfera: -6.25, cilindro: -5.0, eixo: 165, adicao: null },
      dp: 62,
      observacoes: 'Astigmatismo irregular — refração de difícil estabilização.',
    }),
    exame('pac-003', -150, '11:30', 'med-3', 'paquimetria', {
      metodo: 'Óptica (Pentacam)',
      od: { espessuraCentral: 468, pioCorrigida: 14 },
      oe: { espessuraCentral: 441, pioCorrigida: 13 },
      observacoes: 'Afinamento corneano inferior bilateral, mais acentuado em OE.',
    }),

    // pac-004 — catarata
    exame('pac-004', -45, '08:30', 'med-3', 'acuidade-visual', av({ sc: '20/200', cc: '20/100', j: 'J8' }, { sc: '20/160', cc: '20/80', j: 'J6' })),
    exame('pac-004', -45, '08:45', 'med-3', 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada', iris: 'Trófica', cristalino: 'Opacidade nuclear intensa', classificacaoCatarata: 'NO4/NC4' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada', iris: 'Trófica', cristalino: 'Opacidade nuclear moderada', classificacaoCatarata: 'NO3/NC3' },
      observacoes: null,
    }),
    exame('pac-004', 0, '09:00', 'med-3', 'biometria', {
      metodo: 'Óptica (IOL Master)',
      od: { comprimentoAxial: 23.42, k1: 43.12, k2: 44.05, acd: 3.11, lioCalculada: 21.5, refracaoAlvo: -0.25 },
      oe: { comprimentoAxial: 23.61, k1: 42.88, k2: 43.74, acd: 3.2, lioCalculada: 21.0, refracaoAlvo: -0.25 },
      formula: 'Barrett Universal II',
      observacoes: 'Biometria confiável em ambos os olhos.',
    }),
  ]
}

/** Exames dos pacientes de glaucoma avançado, DMRI e uveíte. */
function examesAcompanhamento() {
  return [
    // pac-007 — glaucoma avançado, pós-trabeculectomia
    exame('pac-007', -200, '15:00', 'med-1', 'tonometria', pio(14, 9, '15:10')),
    exame('pac-007', -80, '15:30', 'med-1', 'tonometria', pio(15, 11, '15:40')),
    exame('pac-007', -80, '15:50', 'med-1', 'campo-visual', cv('10-2',
      { md: -6.02, psd: 4.88, vfi: 85, ght: 'Fora dos limites normais' },
      { md: -18.44, psd: 9.71, vfi: 48, ght: 'Fora dos limites normais', achados: 'Ilha central de visão residual' }),
      'AO', ANEXO_CV),
    exame('pac-007', -80, '16:05', 'med-1', 'estereofoto-papila', {
      od: { relacaoED: 0.7, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior', hemorragiaDisco: false, atrofiaPeri: 'Zona beta' },
      oe: { relacaoED: 0.95, tamanhoDisco: 'Médio', rimaNeural: 'Rima praticamente ausente', hemorragiaDisco: false, atrofiaPeri: 'Alfa + beta' },
      observacoes: 'Escavação terminal em OE.',
    }, 'AO', ANEXO_FUNDO),

    // pac-009 — DMRI exsudativa
    exame('pac-009', -120, '16:00', 'med-2', 'oct-macula', {
      equipamento: 'Cirrus',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 398, volumeMacular: 10.9, rnfl: 92, perfilFoveal: 'Ausente', achados: 'Fluido sub-retiniano e descolamento do EPR' },
      oe: { espessuraCentral: 254, volumeMacular: 8.1, rnfl: 95, perfilFoveal: 'Preservado', achados: 'Drusas moles' },
      observacoes: 'Atividade exsudativa em OD.',
    }, 'AO', ANEXO_OCT),
    exame('pac-009', -30, '16:00', 'med-2', 'oct-macula', {
      equipamento: 'Cirrus',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 301, volumeMacular: 9.4, rnfl: 92, perfilFoveal: 'Alterado', achados: 'Redução do fluido sub-retiniano após anti-VEGF' },
      oe: { espessuraCentral: 251, volumeMacular: 8.0, rnfl: 95, perfilFoveal: 'Preservado', achados: 'Drusas moles estáveis' },
      observacoes: 'Boa resposta ao tratamento.',
    }, 'AO', ANEXO_OCT),
    exame('pac-009', -30, '16:15', 'med-2', 'acuidade-visual', av({ sc: '20/200', cc: '20/100' }, { sc: '20/40', cc: '20/25' })),

    // pac-012 — suspeita de progressão
    exame('pac-012', -70, '13:30', 'med-1', 'tonometria', pio(22, 24, '13:45')),
    exame('pac-012', 0, '08:30', 'med-1', 'curva-tensional', {
      medicoes: [
        { hora: '06:00', od: 24, oe: 26 },
        { hora: '09:00', od: 21, oe: 23 },
        { hora: '12:00', od: 19, oe: 21 },
        { hora: '15:00', od: 18, oe: 20 },
        { hora: '18:00', od: 20, oe: 22 },
      ],
      metodo: 'Goldmann (aplanação)',
      emUsoMedicacao: true,
      observacoes: 'Pico matinal com flutuação de 8 mmHg em OE.',
    }),
    exame('pac-012', 0, '09:10', 'med-1', 'sobrecarga-hidrica', {
      volumeIngerido: 1000,
      medicoes: [
        { momento: 'Basal', od: 19, oe: 21 },
        { momento: '15 min', od: 24, oe: 27 },
        { momento: '30 min', od: 26, oe: 29 },
        { momento: '45 min', od: 23, oe: 25 },
      ],
      observacoes: 'Elevação de 8 mmHg em OE — teste positivo.',
    }),

    // pac-011 — uveíte anterior
    exame('pac-011', -100, '10:30', 'med-3', 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Hiperemia ciliar 2+', cornea: 'Precipitados ceráticos finos', camaraAnterior: 'Células 2+, flare 1+', iris: 'Sinéquias posteriores focais', cristalino: 'Transparente', classificacaoCatarata: 'Ausente' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Transparente', classificacaoCatarata: 'Ausente' },
      observacoes: 'Uveíte anterior aguda em OD.',
    }),
    exame('pac-011', -100, '10:45', 'med-3', 'tonometria', pio(16, 14, '10:45')),
  ]
}

/**
 * Anamneses (RFANA01–02).
 *
 * O registro guarda só os campos respondidos — os em branco não entram —,
 * usando a mesma regra que o formulário aplica ao salvar.
 */
function construirAnamneses() {
  const a = (pacienteId, dias, medicoId, respostas) => {
    const data = em(dias, '09:05')
    return {
      id: uid('ana'),
      pacienteId,
      data,
      responsavelId: medicoId,
      ...somenteAnamnesePreenchidos(respostas),
      criadoEm: data,
    }
  }

  return [
    a('pac-001', -420, 'med-1', {
      queixaPrincipal: 'Acompanhamento de glaucoma, sem queixas visuais novas.',
      tempoSintomas: 'Mais de 1 ano',
      cirurgiasPrevias: 'Facectomia com implante de LIO em OD (2019)',
      usoOculos: true,
      tipoOculos: 'Multifocal',
      usoLentesContato: false,
      historiaFamiliar: 'Mãe com glaucoma.',
    }),
    a('pac-002', -240, 'med-2', {
      queixaPrincipal: 'Visão embaçada e manchas escuras no olho direito.',
      tempoSintomas: '3 a 6 meses',
      historiaDoencaAtual: 'Piora progressiva nos últimos meses, associada a controle glicêmico irregular.',
      usoOculos: true,
      tipoOculos: 'Para perto',
      usoLentesContato: false,
      historiaFamiliar: 'Pai diabético com perda visual.',
    }),
    a('pac-003', -150, 'med-3', {
      queixaPrincipal: 'Distorção das imagens e piora progressiva da visão, pior à noite.',
      tempoSintomas: '6 meses a 1 ano',
      usoOculos: true,
      tipoOculos: 'Para longe',
      usoLentesContato: true,
      tipoLentes: 'Rígidas gás-permeáveis',
      historiaFamiliar: 'Irmão com ceratocone.',
    }),
    a('pac-004', -45, 'med-3', {
      queixaPrincipal: 'Visão turva progressiva em ambos os olhos, com ofuscamento.',
      tempoSintomas: 'Mais de 1 ano',
      usoOculos: true,
      tipoOculos: 'Bifocal',
      usoLentesContato: false,
      historiaFamiliar: 'Sem antecedentes relevantes.',
    }),
    // Nem toda consulta responde a anamnese inteira.
    a('pac-009', -120, 'med-2', {
      queixaPrincipal: 'Mancha central no olho direito e linhas tortas.',
      tempoSintomas: '1 a 3 meses',
      historiaFamiliar: 'Mãe com degeneração macular.',
    }),
  ]
}

/** Procedimentos terapêuticos (RFPRO01) — separados dos exames. */
function construirProcedimentos() {
  const p = (pacienteId, dias, medicoId, dados) => {
    const data = em(dias, '11:00')
    return { id: uid('pro'), pacienteId, data, responsavelId: medicoId, intercorrencias: '', criadoEm: data, ...dados }
  }

  return [
    p('pac-001', -300, 'med-1', {
      procedimentoId: 'slt',
      nome: 'Trabeculoplastia seletiva a laser (SLT)',
      categoria: 'Laser',
      olho: 'OE',
      descricao: '360 graus, 100 disparos, energia média de 0,8 mJ.',
      intercorrencias: 'Sem intercorrências. PIO 1h após: 20 mmHg.',
    }),
    p('pac-007', -200, 'med-1', {
      procedimentoId: 'yag-iridotomia',
      nome: 'Iridotomia periférica com YAG laser',
      categoria: 'Laser',
      olho: 'OD',
      descricao: 'Iridotomia superior, patente ao final do procedimento.',
    }),
    p('pac-009', -120, 'med-2', {
      procedimentoId: 'anti-vegf',
      nome: 'Injeção intravítrea de anti-VEGF',
      categoria: 'Injeção',
      olho: 'OD',
      descricao: 'Aflibercepte 2 mg, via pars plana, 3,5 mm do limbo.',
      intercorrencias: 'Sem intercorrências. Orientada sobre sinais de alarme.',
    }),
    p('pac-009', -30, 'med-2', {
      procedimentoId: 'anti-vegf',
      nome: 'Injeção intravítrea de anti-VEGF',
      categoria: 'Injeção',
      olho: 'OD',
      descricao: 'Segunda aplicação do regime de carga.',
    }),
    p('pac-002', -90, 'med-2', {
      procedimentoId: 'fotocoagulacao',
      nome: 'Fotocoagulação retiniana a laser',
      categoria: 'Laser',
      olho: 'OD',
      descricao: 'Fotocoagulação focal em área de microaneurismas temporais à mácula.',
    }),
  ]
}

/** Diagnósticos e plano terapêutico (RFDIA01–02). */
function construirDiagnosticos() {
  const d = (pacienteId, dias, medicoId, cids, plano) => {
    const data = em(dias, '11:30')
    return { id: uid('dia'), pacienteId, data, responsavelId: medicoId, cids, planoTerapeutico: plano, criadoEm: data }
  }

  return [
    d('pac-001', 0, 'med-1',
      [{ codigo: 'H40.1', descricao: 'Glaucoma primário de ângulo aberto' }, { codigo: 'H25.1', descricao: 'Catarata senil nuclear' }],
      'Manter latanoprosta 1 gota à noite em ambos os olhos. Solicitar curva tensional diária. Retorno em 3 meses com campo visual.'),
    d('pac-002', -90, 'med-2',
      [{ codigo: 'H36.0', descricao: 'Retinopatia diabética' }, { codigo: 'H35.8', descricao: 'Outras afecções especificadas da retina' }],
      'Edema macular diabético em OD: indicar injeção intravítrea de anti-VEGF. Reforçar controle glicêmico com endocrinologista. Retorno em 6 semanas com OCT.'),
    d('pac-003', -150, 'med-3',
      [{ codigo: 'H18.6', descricao: 'Ceratocone' }, { codigo: 'H04.1', descricao: 'Outros transtornos da glândula lacrimal (olho seco)' }],
      'Ceratocone bilateral com progressão em OE. Indicar crosslinking de colágeno corneano em OE. Manter lubrificação ocular.'),
    d('pac-004', 0, 'med-3',
      [{ codigo: 'H25.1', descricao: 'Catarata senil nuclear' }, { codigo: 'H35.3', descricao: 'Degeneração da mácula e do polo posterior' }],
      'Indicada facectomia com implante de LIO em OD, seguida de OE. Biometria realizada. Orientado sobre expectativa visual limitada pela maculopatia.'),
    d('pac-007', -80, 'med-1',
      [{ codigo: 'H40.1', descricao: 'Glaucoma primário de ângulo aberto' }],
      'Glaucoma avançado em OE com bolsa filtrante funcionante. Meta pressórica de 12 mmHg. Manter associação fixa dorzolamida + timolol em OD.'),
    d('pac-009', -30, 'med-2',
      [{ codigo: 'H35.3', descricao: 'Degeneração da mácula e do polo posterior' }],
      'DMRI exsudativa em OD com boa resposta ao anti-VEGF. Manter regime treat-and-extend. Próxima injeção agendada.'),
    d('pac-011', -100, 'med-3',
      [{ codigo: 'H20.0', descricao: 'Iridociclite aguda e subaguda' }],
      'Uveíte anterior aguda em OD, provavelmente associada à artrite reumatoide. Prednisolona tópica com desmame gradual. Manter acompanhamento reumatológico.'),
    d('pac-012', 0, 'med-1',
      [{ codigo: 'H40.0', descricao: 'Suspeita de glaucoma / hipertensão ocular' }],
      'Curva tensional com pico matinal e teste de sobrecarga hídrica positivo. Iniciar hipotensor tópico e reavaliar em 6 semanas.'),
  ]
}

/** Prescrições: óculos, medicamentos e atestados (RFPRE01–03). */
function construirPrescricoes() {
  const r = (pacienteId, dias, medicoId, tipo, dados) => {
    const data = em(dias, '11:45')
    return { id: uid('pre'), pacienteId, data, responsavelId: medicoId, tipo, dados, criadoEm: data }
  }

  return [
    r('pac-001', 0, 'med-1', 'medicamentos', {
      itens: [
        { medicamento: 'Latanoprosta 0,005% colírio', olho: 'AO', posologia: '1 gota à noite', duracao: 'Uso contínuo' },
        { medicamento: 'Carmelose 0,5% colírio', olho: 'AO', posologia: '1 gota 4x ao dia', duracao: '30 dias' },
      ],
      orientacoes: 'Aguardar 5 minutos entre a instilação de colírios diferentes.',
    }),
    r('pac-001', 0, 'med-1', 'oculos', {
      finalidade: 'Multifocal',
      od: { esfera: 1.25, cilindro: -0.75, eixo: 90, adicao: 2.5 },
      oe: { esfera: 1.5, cilindro: -1.0, eixo: 85, adicao: 2.5 },
      dp: 60,
      observacoes: 'Lentes com tratamento antirreflexo e filtro para luz azul.',
    }),
    r('pac-003', -150, 'med-3', 'oculos', {
      finalidade: 'Uso constante',
      od: { esfera: -4.75, cilindro: -3.5, eixo: 15, adicao: null },
      oe: { esfera: -6.25, cilindro: -5.0, eixo: 165, adicao: null },
      dp: 62,
      observacoes: 'Correção parcial — paciente adaptada a lentes de contato rígidas.',
    }),
    r('pac-004', -45, 'med-3', 'atestado', {
      finalidade: 'Afastamento',
      dias: 2,
      cid: { codigo: 'H25.1', descricao: 'Catarata senil nuclear' },
      incluirCid: true,
      texto: 'Atesto para os devidos fins que o(a) paciente esteve sob cuidados médicos oftalmológicos nesta data, necessitando de afastamento de suas atividades habituais por 2 (dois) dia(s).',
    }),
    r('pac-011', -100, 'med-3', 'medicamentos', {
      itens: [
        { medicamento: 'Prednisolona 1% colírio', olho: 'OD', posologia: '1 gota 6/6h', duracao: '7 dias, com desmame semanal' },
        { medicamento: 'Ciclopentolato 1% colírio', olho: 'OD', posologia: '1 gota 12/12h', duracao: '5 dias' },
      ],
      orientacoes: 'Retornar imediatamente em caso de piora da dor ou da visão.',
    }),
    r('pac-012', 0, 'med-1', 'medicamentos', {
      itens: [
        { medicamento: 'Brimonidina 0,2% colírio', olho: 'AO', posologia: '1 gota 12/12h', duracao: 'Uso contínuo' },
      ],
      orientacoes: 'Reavaliar PIO em 6 semanas.',
    }),
  ]
}

/** Registro de acessos ao prontuário — trilha de auditoria (RNFSEG01 / LGPD). */
function construirAcessos(exames) {
  const vistos = new Set()
  return exames
    .slice()
    .reverse()
    .filter((e) => {
      const chave = `${e.pacienteId}-${e.data.slice(0, 10)}`
      if (vistos.has(chave)) return false
      vistos.add(chave)
      return true
    })
    .slice(0, 20)
    .map((e) => ({
      id: uid('acs'),
      pacienteId: e.pacienteId,
      data: e.data,
      usuarioId: e.responsavelId,
      acao: 'Visualização do prontuário',
      finalidade: 'Assistência à saúde',
    }))
}

/**
 * Aplica uma correção a um registro já semeado.
 *
 * A correção não apaga nada: o registro anterior é marcado como substituído e
 * uma versão nova entra na coleção. A data clínica é preservada — o exame foi
 * feito quando foi feito —, só o `criadoEm` reflete o momento da correção.
 */
function aplicarCorrecao(lista, alvo, { quandoDias, motivo, alterar }) {
  const anterior = lista.find(alvo)
  if (!anterior) throw new Error('[seed] registro a corrigir não encontrado')

  const nova = structuredClone(anterior)
  nova.id = uid(anterior.id.split('-')[0])
  nova.corrigeId = anterior.id
  nova.corrigidoPorId = null
  nova.motivoCorrecao = motivo
  nova.criadoEm = em(quandoDias, '17:20')
  alterar(nova)

  anterior.corrigidoPorId = nova.id
  lista.push(nova)
}

/** Monta o estado inicial completo das coleções do banco fantasma. */
export function criarEstadoInicial() {
  seq = 0
  const exames = [...examesPac001(), ...examesDemais(), ...examesAcompanhamento()]
  const diagnosticos = construirDiagnosticos()

  // Duas correções já semeadas, para que o recurso apareça na abertura.
  aplicarCorrecao(exames, (e) => e.pacienteId === 'pac-001' && e.tipo === 'tonometria' && e.data.startsWith(em(-60, '09:00').slice(0, 10)), {
    quandoDias: -60,
    motivo: 'Valor de OE digitado trocado no lançamento original.',
    alterar: (e) => { e.dados.oe.pio = 21 },
  })

  aplicarCorrecao(diagnosticos, (d) => d.pacienteId === 'pac-012', {
    quandoDias: 0,
    motivo: 'Conduta revista após o resultado do teste de sobrecarga hídrica.',
    alterar: (d) => {
      d.planoTerapeutico =
        'Curva tensional com pico matinal e teste de sobrecarga hídrica positivo. Iniciar latanoprosta 1 gota à noite em ambos os olhos e reavaliar em 4 semanas com nova curva.'
    },
  })

  return {
    pacientes: structuredClone(PACIENTES),
    anamneses: construirAnamneses(),
    exames,
    procedimentos: construirProcedimentos(),
    diagnosticos,
    prescricoes: construirPrescricoes(),
    acessos: construirAcessos(exames),
  }
}

/**
 * Geração do estado inicial do "banco" do protótipo.
 *
 * As datas são calculadas a partir de hoje para que a demonstração sempre
 * tenha agenda do dia e um histórico recente, independentemente de quando
 * for executada.
 */
import { PACIENTES } from './pacientes.js'

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

/** Consultas: passado (finalizadas), hoje (fluxo ativo) e futuro (agendadas). */
function construirConsultas() {
  const c = (pacienteId, dias, hora, medicoId, salaId, status, tipo, motivo) => ({
    id: uid('con'),
    pacienteId,
    medicoId,
    salaId,
    data: em(dias, hora),
    status,
    tipo,
    motivo,
    criadoEm: em(dias - 7, '09:00'),
  })

  return [
    // --- Histórico (consultas finalizadas) ---
    c('pac-001', -420, '09:00', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-001', -300, '09:30', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-001', -180, '10:00', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-001', -60, '09:00', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-002', -240, '14:00', 'med-2', 'sala-2', 'finalizado', 'Primeira consulta', 'Baixa visual progressiva'),
    c('pac-002', -90, '14:30', 'med-2', 'sala-2', 'finalizado', 'Retorno', 'Retinopatia diabética'),
    c('pac-003', -150, '11:00', 'med-3', 'sala-3', 'finalizado', 'Primeira consulta', 'Distorção visual'),
    c('pac-004', -45, '08:30', 'med-3', 'sala-3', 'finalizado', 'Primeira consulta', 'Catarata bilateral'),
    c('pac-007', -200, '15:00', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Pós-operatório de trabeculectomia'),
    c('pac-007', -80, '15:30', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-009', -120, '16:00', 'med-2', 'sala-2', 'finalizado', 'Retorno', 'DMRI exsudativa'),
    c('pac-009', -30, '16:00', 'med-2', 'sala-2', 'finalizado', 'Retorno', 'DMRI exsudativa'),
    c('pac-011', -100, '10:30', 'med-3', 'sala-3', 'finalizado', 'Retorno', 'Uveíte anterior'),
    c('pac-012', -70, '13:30', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Suspeita de progressão'),

    // --- Hoje (fluxo de atendimento ativo, RFAGE02) ---
    c('pac-001', 0, '08:00', 'med-1', 'sala-1', 'finalizado', 'Retorno', 'Controle de glaucoma'),
    c('pac-012', 0, '08:30', 'med-1', 'sala-1', 'com-medico', 'Retorno', 'Curva tensional diária'),
    c('pac-004', 0, '09:00', 'med-3', 'sala-3', 'em-exame', 'Retorno', 'Biometria pré-operatória'),
    c('pac-002', 0, '09:30', 'med-2', 'sala-2', 'em-exame', 'Retorno', 'Retinografia e OCT'),
    c('pac-008', 0, '10:00', 'med-3', 'sala-3', 'aguardando-triagem', 'Primeira consulta', 'Baixa acuidade para longe'),
    c('pac-005', 0, '10:30', 'med-4', 'sala-2', 'aguardando-triagem', 'Retorno', 'Controle de ambliopia'),
    c('pac-009', 0, '11:00', 'med-2', 'sala-2', 'agendado', 'Retorno', 'Injeção intravítrea'),
    c('pac-007', 0, '14:00', 'med-1', 'sala-1', 'agendado', 'Retorno', 'Campo visual'),
    c('pac-006', 0, '14:30', 'med-3', 'sala-3', 'agendado', 'Primeira consulta', 'Fadiga visual'),
    c('pac-011', 0, '15:00', 'med-3', 'sala-3', 'agendado', 'Retorno', 'Uveíte anterior'),

    // --- Próximos dias ---
    c('pac-010', 1, '08:30', 'med-3', 'sala-3', 'agendado', 'Primeira consulta', 'Avaliação ocupacional'),
    c('pac-003', 1, '09:30', 'med-3', 'sala-3', 'agendado', 'Retorno', 'Ceratocone — avaliar crosslinking'),
    c('pac-001', 2, '09:00', 'med-1', 'sala-1', 'agendado', 'Retorno', 'Curva tensional diária'),
    c('pac-004', 2, '10:00', 'med-3', 'sala-proc', 'agendado', 'Procedimento', 'Facectomia — avaliação'),
    c('pac-009', 3, '16:00', 'med-2', 'sala-proc', 'agendado', 'Procedimento', 'Injeção intravítrea de anti-VEGF'),
  ]
}

/** Cria um exame vinculado a uma consulta. */
function exame(consulta, tipo, dados, olho = 'AO', anexos = []) {
  return {
    id: uid('exa'),
    pacienteId: consulta.pacienteId,
    consultaId: consulta.id,
    tipo,
    olho,
    data: consulta.data,
    responsavelId: consulta.medicoId,
    dados,
    anexos,
    criadoEm: consulta.data,
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

/** Histórico de exames. Séries longitudinais para os pacientes de glaucoma. */
function construirExames(consultas) {
  // Exames só existem em consultas já realizadas — as futuras ficam de fora.
  const fimDeHoje = new Date(hoje().getTime() + DIA).getTime()
  const de = (pacienteId) =>
    consultas.filter((c) => c.pacienteId === pacienteId && new Date(c.data).getTime() < fimDeHoje)
  const out = []
  const add = (...e) => out.push(...e)

  // --- pac-001 (glaucoma + catarata): série de PIO e campo visual ---
  const c1 = de('pac-001')
  const seriePIO = [
    [18, 19],
    [21, 22],
    [19, 20],
    [23, 24],
    [17, 18],
  ]
  c1.forEach((consulta, i) => {
    add(exame(consulta, 'tonometria', pio(...seriePIO[i])))
    add(exame(consulta, 'acuidade-visual', av({ sc: '20/60', cc: '20/30', j: 'J3' }, { sc: '20/70', cc: '20/40', j: 'J4' })))
  })
  add(
    exame(c1[0], 'campo-visual', cv('24-2',
      { md: -3.12, psd: 2.88, vfi: 94, ght: 'Limítrofe' },
      { md: -4.05, psd: 3.41, vfi: 91, ght: 'Fora dos limites normais', achados: 'Degrau nasal superior' }),
      'AO', ANEXO_CV),
    exame(c1[2], 'campo-visual', cv('24-2',
      { md: -4.88, psd: 3.62, vfi: 90, ght: 'Fora dos limites normais' },
      { md: -6.71, psd: 5.10, vfi: 84, ght: 'Fora dos limites normais', achados: 'Escotoma arqueado superior' }),
      'AO', ANEXO_CV),
    exame(c1[4], 'campo-visual', cv('24-2',
      { md: -5.40, psd: 4.02, vfi: 88, ght: 'Fora dos limites normais' },
      { md: -8.24, psd: 6.33, vfi: 79, ght: 'Fora dos limites normais', achados: 'Progressão do escotoma arqueado' }),
      'AO', ANEXO_CV),
    exame(c1[1], 'paquimetria', {
      metodo: 'Ultrassônica',
      od: { espessuraCentral: 512, pioCorrigida: 22 },
      oe: { espessuraCentral: 505, pioCorrigida: 23 },
      observacoes: 'Córneas finas — PIO real provavelmente subestimada.',
    }),
    exame(c1[3], 'gonioscopia', {
      od: { superior: 'Grau III', inferior: 'Grau IV (aberto)', nasal: 'Grau III', temporal: 'Grau IV (aberto)', pigmentacao: '2+', sinequias: false },
      oe: { superior: 'Grau III', inferior: 'Grau III', nasal: 'Grau II', temporal: 'Grau III', pigmentacao: '2+', sinequias: false },
      lente: 'Zeiss 4 espelhos',
      observacoes: null,
    }),
    exame(c1[3], 'estereofoto-papila', {
      od: { relacaoED: 0.6, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior', hemorragiaDisco: false, atrofiaPeri: 'Zona beta' },
      oe: { relacaoED: 0.75, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior e superior', hemorragiaDisco: true, atrofiaPeri: 'Alfa + beta' },
      observacoes: 'Hemorragia de disco em OE — sinal de progressão.',
    }, 'AO', ANEXO_FUNDO),
    exame(c1[4], 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Pseudofácico, LIO centrada', classificacaoCatarata: 'Ausente' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Opacidade nuclear moderada', classificacaoCatarata: 'NO3/NC3' },
      observacoes: null,
    }),
  )

  // --- pac-002 (retinopatia diabética): imagem e OCT ---
  const c2 = de('pac-002')
  add(
    exame(c2[0], 'acuidade-visual', av({ sc: '20/80', cc: '20/50' }, { sc: '20/60', cc: '20/40' })),
    exame(c2[0], 'fundoscopia', {
      midriase: true,
      od: { papila: 'Contornos nítidos', escavacao: 0.3, macula: 'Exsudatos duros perifoveais', vasos: 'Microaneurismas em arcada temporal', periferia: 'Hemorragias em chama de vela' },
      oe: { papila: 'Contornos nítidos', escavacao: 0.3, macula: 'Brilho foveal preservado', vasos: 'Microaneurismas esparsos', periferia: 'Aplicada, sem roturas' },
      observacoes: 'Retinopatia diabética não proliferativa moderada em OD.',
    }, 'AO', ANEXO_FUNDO),
    exame(c2[1], 'retinografia', {
      modalidade: 'Grande angular (200°)',
      midriase: true,
      od: { qualidade: 'Boa', achados: 'Microaneurismas e exsudatos duros no polo posterior' },
      oe: { qualidade: 'Boa', achados: 'Microaneurismas esparsos' },
      observacoes: null,
    }, 'AO', ANEXO_FUNDO),
    exame(c2[1], 'oct-macula', {
      equipamento: 'Spectralis',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 342, volumeMacular: 9.8, rnfl: 96, perfilFoveal: 'Alterado', achados: 'Edema macular cistoide' },
      oe: { espessuraCentral: 268, volumeMacular: 8.4, rnfl: 94, perfilFoveal: 'Preservado', achados: null },
      observacoes: 'Edema macular diabético em OD.',
    }, 'AO', ANEXO_OCT),
  )

  // --- pac-003 (ceratocone) ---
  const c3 = de('pac-003')
  add(
    exame(c3[0], 'acuidade-visual', av({ sc: '20/200', cc: '20/60' }, { sc: '20/400', cc: '20/80' })),
    exame(c3[0], 'refracao', {
      tipo: 'Estática',
      od: { esfera: -4.75, cilindro: -3.5, eixo: 15, adicao: null },
      oe: { esfera: -6.25, cilindro: -5.0, eixo: 165, adicao: null },
      dp: 62,
      observacoes: 'Astigmatismo irregular — refração de difícil estabilização.',
    }),
    exame(c3[0], 'paquimetria', {
      metodo: 'Óptica (Pentacam)',
      od: { espessuraCentral: 468, pioCorrigida: 14 },
      oe: { espessuraCentral: 441, pioCorrigida: 13 },
      observacoes: 'Afinamento corneano inferior bilateral, mais acentuado em OE.',
    }),
  )

  // --- pac-004 (catarata): biometria pré-operatória ---
  const c4 = de('pac-004')
  add(
    exame(c4[0], 'acuidade-visual', av({ sc: '20/200', cc: '20/100', j: 'J8' }, { sc: '20/160', cc: '20/80', j: 'J6' })),
    exame(c4[0], 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada', iris: 'Trófica', cristalino: 'Opacidade nuclear intensa', classificacaoCatarata: 'NO4/NC4' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada', iris: 'Trófica', cristalino: 'Opacidade nuclear moderada', classificacaoCatarata: 'NO3/NC3' },
      observacoes: null,
    }),
    exame(c4[1], 'biometria', {
      metodo: 'Óptica (IOL Master)',
      od: { comprimentoAxial: 23.42, k1: 43.12, k2: 44.05, acd: 3.11, lioCalculada: 21.5, refracaoAlvo: -0.25 },
      oe: { comprimentoAxial: 23.61, k1: 42.88, k2: 43.74, acd: 3.2, lioCalculada: 21.0, refracaoAlvo: -0.25 },
      formula: 'Barrett Universal II',
      observacoes: 'Biometria confiável em ambos os olhos.',
    }),
  )

  // --- pac-007 (glaucoma avançado): série de PIO pós-trabeculectomia ---
  const c7 = de('pac-007')
  add(
    exame(c7[0], 'tonometria', pio(14, 9, '15:10')),
    exame(c7[1], 'tonometria', pio(15, 11, '15:40')),
    exame(c7[1], 'campo-visual', cv('10-2',
      { md: -6.02, psd: 4.88, vfi: 85, ght: 'Fora dos limites normais' },
      { md: -18.44, psd: 9.71, vfi: 48, ght: 'Fora dos limites normais', achados: 'Ilha central de visão residual' }),
      'AO', ANEXO_CV),
    exame(c7[1], 'estereofoto-papila', {
      od: { relacaoED: 0.7, tamanhoDisco: 'Médio', rimaNeural: 'Afilamento inferior', hemorragiaDisco: false, atrofiaPeri: 'Zona beta' },
      oe: { relacaoED: 0.95, tamanhoDisco: 'Médio', rimaNeural: 'Rima praticamente ausente', hemorragiaDisco: false, atrofiaPeri: 'Alfa + beta' },
      observacoes: 'Escavação terminal em OE.',
    }, 'AO', ANEXO_FUNDO),
  )

  // --- pac-009 (DMRI exsudativa): OCT seriado ---
  const c9 = de('pac-009')
  add(
    exame(c9[0], 'oct-macula', {
      equipamento: 'Cirrus',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 398, volumeMacular: 10.9, rnfl: 92, perfilFoveal: 'Ausente', achados: 'Fluido sub-retiniano e descolamento do EPR' },
      oe: { espessuraCentral: 254, volumeMacular: 8.1, rnfl: 95, perfilFoveal: 'Preservado', achados: 'Drusas moles' },
      observacoes: 'Atividade exsudativa em OD.',
    }, 'AO', ANEXO_OCT),
    exame(c9[1], 'oct-macula', {
      equipamento: 'Cirrus',
      protocolo: 'Macular Cube 512x128',
      od: { espessuraCentral: 301, volumeMacular: 9.4, rnfl: 92, perfilFoveal: 'Alterado', achados: 'Redução do fluido sub-retiniano após anti-VEGF' },
      oe: { espessuraCentral: 251, volumeMacular: 8.0, rnfl: 95, perfilFoveal: 'Preservado', achados: 'Drusas moles estáveis' },
      observacoes: 'Boa resposta ao tratamento.',
    }, 'AO', ANEXO_OCT),
    exame(c9[1], 'acuidade-visual', av({ sc: '20/200', cc: '20/100' }, { sc: '20/40', cc: '20/25' })),
  )

  // --- pac-012 (suspeita de progressão): curva tensional e sobrecarga hídrica ---
  const c12 = de('pac-012')
  add(
    exame(c12[0], 'tonometria', pio(22, 24, '13:45')),
    exame(c12[1], 'curva-tensional', {
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
    exame(c12[1], 'sobrecarga-hidrica', {
      volumeIngerido: 1000,
      medicoes: [
        { momento: 'Basal', od: 19, oe: 21 },
        { momento: '15 min', od: 24, oe: 27 },
        { momento: '30 min', od: 26, oe: 29 },
        { momento: '45 min', od: 23, oe: 25 },
      ],
      observacoes: 'Elevação de 8 mmHg em OE — teste positivo.',
    }),
  )

  // --- pac-011 (uveíte) ---
  const c11 = de('pac-011')
  add(
    exame(c11[0], 'biomicroscopia', {
      od: { palpebras: 'Sem alterações', conjuntiva: 'Hiperemia ciliar 2+', cornea: 'Precipitados ceráticos finos', camaraAnterior: 'Células 2+, flare 1+', iris: 'Sinéquias posteriores focais', cristalino: 'Transparente', classificacaoCatarata: 'Ausente' },
      oe: { palpebras: 'Sem alterações', conjuntiva: 'Sem hiperemia', cornea: 'Transparente', camaraAnterior: 'Formada, sem células', iris: 'Trófica', cristalino: 'Transparente', classificacaoCatarata: 'Ausente' },
      observacoes: 'Uveíte anterior aguda em OD.',
    }),
    exame(c11[0], 'tonometria', pio(16, 14, '10:45')),
  )

  return out
}

/** Anamneses (RFANA01–02) — uma por consulta de primeira vez ou retorno relevante. */
function construirAnamneses(consultas) {
  const primeira = (pacienteId) => consultas.find((c) => c.pacienteId === pacienteId)
  const a = (pacienteId, dados) => {
    const consulta = primeira(pacienteId)
    return {
      id: uid('ana'),
      pacienteId,
      consultaId: consulta.id,
      data: consulta.data,
      responsavelId: consulta.medicoId,
      ...dados,
    }
  }

  return [
    a('pac-001', {
      queixaPrincipal: 'Acompanhamento de glaucoma, sem queixas visuais novas.',
      tempoSintomas: 'Mais de 1 ano',
      historiaOcular: {
        cirurgiasPrevias: 'Facectomia com implante de LIO em OD (2019)',
        usoOculos: true,
        tipoOculos: 'Multifocal',
        usoLentesContato: false,
        ultimaTrocaOculos: '2023',
        traumaOcular: false,
      },
      historiaFamiliar: 'Mãe com glaucoma.',
    }),
    a('pac-002', {
      queixaPrincipal: 'Visão embaçada e manchas escuras no olho direito.',
      tempoSintomas: '3 a 6 meses',
      historiaOcular: {
        cirurgiasPrevias: '',
        usoOculos: true,
        tipoOculos: 'Para perto',
        usoLentesContato: false,
        ultimaTrocaOculos: '2021',
        traumaOcular: false,
      },
      historiaFamiliar: 'Pai diabético com perda visual.',
    }),
    a('pac-003', {
      queixaPrincipal: 'Distorção das imagens e piora progressiva da visão, pior à noite.',
      tempoSintomas: '6 meses a 1 ano',
      historiaOcular: {
        cirurgiasPrevias: '',
        usoOculos: true,
        tipoOculos: 'Para longe',
        usoLentesContato: true,
        tipoLentes: 'Rígidas gás-permeáveis',
        ultimaTrocaOculos: '2024',
        traumaOcular: false,
      },
      historiaFamiliar: 'Irmão com ceratocone.',
    }),
    a('pac-004', {
      queixaPrincipal: 'Visão turva progressiva em ambos os olhos, com ofuscamento.',
      tempoSintomas: 'Mais de 1 ano',
      historiaOcular: {
        cirurgiasPrevias: '',
        usoOculos: true,
        tipoOculos: 'Bifocal',
        usoLentesContato: false,
        ultimaTrocaOculos: '2020',
        traumaOcular: false,
      },
      historiaFamiliar: 'Sem antecedentes relevantes.',
    }),
    a('pac-009', {
      queixaPrincipal: 'Mancha central no olho direito e linhas tortas.',
      tempoSintomas: '1 a 3 meses',
      historiaOcular: {
        cirurgiasPrevias: 'Facectomia bilateral (2017)',
        usoOculos: true,
        tipoOculos: 'Multifocal',
        usoLentesContato: false,
        ultimaTrocaOculos: '2022',
        traumaOcular: false,
      },
      historiaFamiliar: 'Mãe com degeneração macular.',
    }),
  ]
}

/** Diagnósticos e plano terapêutico (RFDIA01–02). */
function construirDiagnosticos(consultas) {
  const ultima = (pacienteId) => {
    const lista = consultas.filter((c) => c.pacienteId === pacienteId && c.status === 'finalizado')
    return lista[lista.length - 1]
  }
  const d = (pacienteId, cids, plano) => {
    const consulta = ultima(pacienteId)
    return {
      id: uid('dia'),
      pacienteId,
      consultaId: consulta.id,
      data: consulta.data,
      responsavelId: consulta.medicoId,
      cids,
      planoTerapeutico: plano,
    }
  }

  return [
    d('pac-001',
      [{ codigo: 'H40.1', descricao: 'Glaucoma primário de ângulo aberto' }, { codigo: 'H25.1', descricao: 'Catarata senil nuclear' }],
      'Manter latanoprosta 1 gota à noite em ambos os olhos. Solicitar curva tensional diária. Retorno em 3 meses com campo visual.'),
    d('pac-002',
      [{ codigo: 'H36.0', descricao: 'Retinopatia diabética' }, { codigo: 'H35.8', descricao: 'Outras afecções especificadas da retina' }],
      'Edema macular diabético em OD: indicar injeção intravítrea de anti-VEGF. Reforçar controle glicêmico com endocrinologista. Retorno em 6 semanas com OCT.'),
    d('pac-003',
      [{ codigo: 'H18.6', descricao: 'Ceratocone' }, { codigo: 'H04.1', descricao: 'Outros transtornos da glândula lacrimal (olho seco)' }],
      'Ceratocone bilateral com progressão em OE. Indicar crosslinking de colágeno corneano em OE. Manter lubrificação ocular.'),
    d('pac-004',
      [{ codigo: 'H25.1', descricao: 'Catarata senil nuclear' }, { codigo: 'H35.3', descricao: 'Degeneração da mácula e do polo posterior' }],
      'Indicada facectomia com implante de LIO em OD, seguida de OE. Biometria realizada. Orientado sobre expectativa visual limitada pela maculopatia.'),
    d('pac-007',
      [{ codigo: 'H40.1', descricao: 'Glaucoma primário de ângulo aberto' }],
      'Glaucoma avançado em OE com bolsa filtrante funcionante. Meta pressórica de 12 mmHg. Manter associação fixa dorzolamida + timolol em OD.'),
    d('pac-009',
      [{ codigo: 'H35.3', descricao: 'Degeneração da mácula e do polo posterior' }],
      'DMRI exsudativa em OD com boa resposta ao anti-VEGF. Manter regime treat-and-extend. Próxima injeção agendada.'),
    d('pac-011',
      [{ codigo: 'H20.0', descricao: 'Iridociclite aguda e subaguda' }],
      'Uveíte anterior aguda em OD, provavelmente associada à artrite reumatoide. Prednisolona tópica com desmame gradual. Manter acompanhamento reumatológico.'),
    d('pac-012',
      [{ codigo: 'H40.0', descricao: 'Suspeita de glaucoma / hipertensão ocular' }],
      'Curva tensional com pico matinal e teste de sobrecarga hídrica positivo. Iniciar hipotensor tópico e reavaliar em 6 semanas.'),
  ]
}

/** Procedimentos terapêuticos realizados (RFPRO01). */
function construirProcedimentos(consultas) {
  const consultaDe = (pacienteId, indice = 0) =>
    consultas.filter((c) => c.pacienteId === pacienteId)[indice]

  const p = (pacienteId, indice, dados) => {
    const consulta = consultaDe(pacienteId, indice)
    return {
      id: uid('pro'),
      pacienteId,
      consultaId: consulta.id,
      data: consulta.data,
      responsavelId: consulta.medicoId,
      intercorrencias: '',
      ...dados,
    }
  }

  return [
    p('pac-001', 1, {
      procedimentoId: 'slt',
      nome: 'Trabeculoplastia seletiva a laser (SLT)',
      categoria: 'Laser',
      olho: 'OE',
      descricao: '360 graus, 100 disparos, energia média de 0,8 mJ.',
      intercorrencias: 'Sem intercorrências. PIO 1h após: 20 mmHg.',
    }),
    p('pac-007', 0, {
      procedimentoId: 'yag-iridotomia',
      nome: 'Iridotomia periférica com YAG laser',
      categoria: 'Laser',
      olho: 'OD',
      descricao: 'Iridotomia superior, patente ao final do procedimento.',
    }),
    p('pac-009', 0, {
      procedimentoId: 'anti-vegf',
      nome: 'Injeção intravítrea de anti-VEGF',
      categoria: 'Injeção',
      olho: 'OD',
      descricao: 'Aflibercepte 2 mg, via pars plana, 3,5 mm do limbo.',
      intercorrencias: 'Sem intercorrências. Orientada sobre sinais de alarme.',
    }),
    p('pac-009', 1, {
      procedimentoId: 'anti-vegf',
      nome: 'Injeção intravítrea de anti-VEGF',
      categoria: 'Injeção',
      olho: 'OD',
      descricao: 'Segunda aplicação do regime de carga.',
    }),
    p('pac-002', 1, {
      procedimentoId: 'fotocoagulacao',
      nome: 'Fotocoagulação retiniana a laser',
      categoria: 'Laser',
      olho: 'OD',
      descricao: 'Fotocoagulação focal em área de microaneurismas temporais à mácula.',
    }),
  ]
}

/** Prescrições: óculos, medicamentos e atestados (RFPRE01–03). */
function construirPrescricoes(consultas) {
  const ultima = (pacienteId) => {
    const lista = consultas.filter((c) => c.pacienteId === pacienteId && c.status === 'finalizado')
    return lista[lista.length - 1]
  }
  const r = (pacienteId, tipo, dados) => {
    const consulta = ultima(pacienteId)
    return {
      id: uid('pre'),
      pacienteId,
      consultaId: consulta.id,
      data: consulta.data,
      responsavelId: consulta.medicoId,
      tipo,
      dados,
    }
  }

  return [
    r('pac-001', 'medicamentos', {
      itens: [
        { medicamento: 'Latanoprosta 0,005% colírio', olho: 'AO', posologia: '1 gota à noite', duracao: 'Uso contínuo' },
        { medicamento: 'Carmelose 0,5% colírio', olho: 'AO', posologia: '1 gota 4x ao dia', duracao: '30 dias' },
      ],
      orientacoes: 'Aguardar 5 minutos entre a instilação de colírios diferentes.',
    }),
    r('pac-001', 'oculos', {
      finalidade: 'Multifocal',
      od: { esfera: 1.25, cilindro: -0.75, eixo: 90, adicao: 2.5 },
      oe: { esfera: 1.5, cilindro: -1.0, eixo: 85, adicao: 2.5 },
      dp: 60,
      observacoes: 'Lentes com tratamento antirreflexo e filtro para luz azul.',
    }),
    r('pac-003', 'oculos', {
      finalidade: 'Uso constante',
      od: { esfera: -4.75, cilindro: -3.5, eixo: 15, adicao: null },
      oe: { esfera: -6.25, cilindro: -5.0, eixo: 165, adicao: null },
      dp: 62,
      observacoes: 'Correção parcial — paciente adaptada a lentes de contato rígidas.',
    }),
    r('pac-004', 'atestado', {
      finalidade: 'Afastamento',
      dias: 2,
      cid: { codigo: 'H25.1', descricao: 'Catarata senil nuclear' },
      incluirCid: true,
      texto: 'Atesto para os devidos fins que o paciente esteve sob cuidados médicos oftalmológicos nesta data, necessitando de afastamento de suas atividades habituais por 2 (dois) dias.',
    }),
    r('pac-011', 'medicamentos', {
      itens: [
        { medicamento: 'Prednisolona 1% colírio', olho: 'OD', posologia: '1 gota 6/6h', duracao: '7 dias, com desmame semanal' },
        { medicamento: 'Ciclopentolato 1% colírio', olho: 'OD', posologia: '1 gota 12/12h', duracao: '5 dias' },
      ],
      orientacoes: 'Retornar imediatamente em caso de piora da dor ou da visão.',
    }),
    r('pac-012', 'medicamentos', {
      itens: [
        { medicamento: 'Brimonidina 0,2% colírio', olho: 'AO', posologia: '1 gota 12/12h', duracao: 'Uso contínuo' },
      ],
      orientacoes: 'Reavaliar PIO em 6 semanas.',
    }),
  ]
}

/** Registro de acessos ao prontuário — trilha de auditoria (RNFSEG01 / LGPD). */
function construirAcessos(consultas) {
  return consultas
    .filter((c) => c.status === 'finalizado')
    .slice(-20)
    .map((c) => ({
      id: uid('acs'),
      pacienteId: c.pacienteId,
      data: c.data,
      usuarioId: c.medicoId,
      acao: 'Visualização do prontuário',
      finalidade: 'Assistência à saúde',
    }))
}

/** Monta o estado inicial completo das coleções do banco fantasma. */
export function criarEstadoInicial() {
  seq = 0
  const consultas = construirConsultas()
  return {
    pacientes: structuredClone(PACIENTES),
    consultas,
    anamneses: construirAnamneses(consultas),
    exames: construirExames(consultas),
    procedimentos: construirProcedimentos(consultas),
    diagnosticos: construirDiagnosticos(consultas),
    prescricoes: construirPrescricoes(consultas),
    acessos: construirAcessos(consultas),
  }
}

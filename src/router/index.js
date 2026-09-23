import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { titulo: 'Painel', icone: 'pi-home' },
  },
  {
    path: '/agenda',
    name: 'agenda',
    component: () => import('@/views/AgendaView.vue'),
    meta: { titulo: 'Agenda', icone: 'pi-calendar' },
  },
  {
    path: '/pacientes',
    name: 'pacientes',
    component: () => import('@/views/PacientesView.vue'),
    meta: { titulo: 'Pacientes', icone: 'pi-users' },
  },
  {
    path: '/pacientes/novo',
    name: 'paciente-novo',
    component: () => import('@/views/PacienteFormView.vue'),
    meta: { titulo: 'Novo paciente' },
  },
  {
    path: '/pacientes/:id/editar',
    name: 'paciente-editar',
    component: () => import('@/views/PacienteFormView.vue'),
    props: true,
    meta: { titulo: 'Editar paciente' },
  },
  {
    path: '/pacientes/:id',
    component: () => import('@/views/ProntuarioView.vue'),
    props: true,
    children: [
      { path: '', redirect: { name: 'prontuario-timeline' } },
      { path: 'timeline', name: 'prontuario-timeline', component: () => import('@/views/prontuario/TimelineTab.vue'), meta: { aba: 'Histórico' } },
      { path: 'anamnese', name: 'prontuario-anamnese', component: () => import('@/views/prontuario/AnamneseTab.vue'), meta: { aba: 'Anamnese' } },
      { path: 'exames', name: 'prontuario-exames', component: () => import('@/views/prontuario/ExamesTab.vue'), meta: { aba: 'Exames' } },
      { path: 'procedimentos', name: 'prontuario-procedimentos', component: () => import('@/views/prontuario/ProcedimentosTab.vue'), meta: { aba: 'Procedimentos' } },
      { path: 'diagnosticos', name: 'prontuario-diagnosticos', component: () => import('@/views/prontuario/DiagnosticosTab.vue'), meta: { aba: 'Diagnósticos' } },
      { path: 'prescricoes', name: 'prontuario-prescricoes', component: () => import('@/views/prontuario/PrescricoesTab.vue'), meta: { aba: 'Prescrições' } },
    ],
  },
  {
    path: '/atendimento/:consultaId',
    name: 'atendimento',
    component: () => import('@/views/AtendimentoView.vue'),
    props: true,
    meta: { titulo: 'Atendimento' },
  },
  {
    path: '/impressao/:prescricaoId',
    name: 'impressao',
    component: () => import('@/views/ImpressaoView.vue'),
    props: true,
    meta: { titulo: 'Impressão', semLayout: true },
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

export default createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

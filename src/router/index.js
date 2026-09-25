import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: { name: 'pacientes' } },
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
      { path: '', redirect: { name: 'prontuario-antecedentes' } },
      { path: 'antecedentes', name: 'prontuario-antecedentes', component: () => import('@/views/prontuario/AntecedentesTab.vue'), meta: { aba: 'Antecedentes' } },
      { path: 'alergias', name: 'prontuario-alergias', component: () => import('@/views/prontuario/AlergiasTab.vue'), meta: { aba: 'Alergias' } },
      { path: 'anamnese', name: 'prontuario-anamnese', component: () => import('@/views/prontuario/AnamneseTab.vue'), meta: { aba: 'Anamnese' } },
      { path: 'exames', name: 'prontuario-exames', component: () => import('@/views/prontuario/ExamesTab.vue'), meta: { aba: 'Exames' } },
      { path: 'procedimentos', name: 'prontuario-procedimentos', component: () => import('@/views/prontuario/ProcedimentosTab.vue'), meta: { aba: 'Procedimentos' } },
      { path: 'diagnosticos', name: 'prontuario-diagnosticos', component: () => import('@/views/prontuario/DiagnosticosTab.vue'), meta: { aba: 'Diagnósticos' } },
      { path: 'prescricoes', name: 'prontuario-prescricoes', component: () => import('@/views/prontuario/PrescricoesTab.vue'), meta: { aba: 'Prescrições' } },
    ],
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

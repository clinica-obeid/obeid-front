import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api.js'
import { usePacientesStore } from './pacientes.js'
import { isoLocal } from '@/utils/formato.js'

export const useAgendaStore = defineStore('agenda', () => {
  const data = ref(isoLocal())
  const filtroMedico = ref(null)
  const filtroSala = ref(null)
  const consultas = ref([])
  const carregando = ref(false)

  async function carregar() {
    carregando.value = true
    try {
      consultas.value = await api.agenda.list({
        data: data.value,
        medicoId: filtroMedico.value,
        salaId: filtroSala.value,
      })
      // Garante que os nomes dos pacientes estejam disponíveis para a agenda.
      const pacientes = usePacientesStore()
      if (!pacientes.lista.length) await pacientes.buscar()
    } finally {
      carregando.value = false
    }
  }

  async function agendar(consulta) {
    const nova = await api.agenda.create(consulta)
    if (isoLocal(new Date(nova.data)) === data.value) await carregar()
    return nova
  }

  async function mudarStatus(id, status) {
    const atualizada = await api.agenda.updateStatus(id, status)
    const i = consultas.value.findIndex((c) => c.id === id)
    if (i !== -1) consultas.value[i] = atualizada
    return atualizada
  }

  /** Consultas do dia agrupadas pelo status do fluxo (RFAGE02). */
  const porStatus = computed(() => {
    const mapa = {}
    for (const c of consultas.value) {
      ;(mapa[c.status] ??= []).push(c)
    }
    return mapa
  })

  const emAndamento = computed(() =>
    consultas.value.filter((c) => ['aguardando-triagem', 'em-exame', 'com-medico'].includes(c.status)))

  return {
    data, filtroMedico, filtroSala, consultas, carregando,
    porStatus, emAndamento,
    carregar, agendar, mudarStatus,
  }
})

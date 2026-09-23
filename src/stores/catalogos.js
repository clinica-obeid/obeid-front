import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api.js'

/** Catálogos de domínio, carregados uma única vez por sessão. */
export const useCatalogosStore = defineStore('catalogos', () => {
  const medicos = ref([])
  const salas = ref([])
  const convenios = ref([])
  const cid10 = ref([])
  const medicamentos = ref([])
  const procedimentos = ref([])
  const comorbidades = ref([])
  const doencasOculares = ref([])
  const alergias = ref([])
  const statusFluxo = ref([])
  const carregado = ref(false)

  async function carregar() {
    if (carregado.value) return
    const c = await api.catalogos.todos()
    medicos.value = c.medicos
    salas.value = c.salas
    convenios.value = c.convenios
    cid10.value = c.cid10
    medicamentos.value = c.medicamentos
    procedimentos.value = c.procedimentos
    comorbidades.value = c.comorbidades
    doencasOculares.value = c.doencasOculares
    alergias.value = c.alergias
    statusFluxo.value = c.statusFluxo
    carregado.value = true
  }

  const medico = (id) => medicos.value.find((m) => m.id === id)
  const sala = (id) => salas.value.find((s) => s.id === id)
  const status = (id) => statusFluxo.value.find((s) => s.id === id) ?? { id, label: id, cor: 'secondary' }

  return {
    medicos, salas, convenios, cid10, medicamentos, procedimentos,
    comorbidades, doencasOculares, alergias, statusFluxo, carregado,
    carregar, medico, sala, status,
  }
})

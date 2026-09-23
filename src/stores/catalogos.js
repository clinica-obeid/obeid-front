import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '@/services/api.js'

/** Catálogos de domínio, carregados uma única vez por sessão. */
export const useCatalogosStore = defineStore('catalogos', () => {
  const medicos = ref([])
  const convenios = ref([])
  const cid10 = ref([])
  const medicamentos = ref([])
  const procedimentos = ref([])
  const comorbidades = ref([])
  const doencasOculares = ref([])
  const alergias = ref([])
  const carregado = ref(false)

  async function carregar() {
    if (carregado.value) return
    const c = await api.catalogos.todos()
    medicos.value = c.medicos
    convenios.value = c.convenios
    cid10.value = c.cid10
    medicamentos.value = c.medicamentos
    procedimentos.value = c.procedimentos
    comorbidades.value = c.comorbidades
    doencasOculares.value = c.doencasOculares
    alergias.value = c.alergias
    carregado.value = true
  }

  const medico = (id) => medicos.value.find((m) => m.id === id)

  return {
    medicos, convenios, cid10, medicamentos, procedimentos,
    comorbidades, doencasOculares, alergias, carregado,
    carregar, medico,
  }
})

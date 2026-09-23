import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { api } from '@/services/api.js'

export const usePacientesStore = defineStore('pacientes', () => {
  const lista = ref([])
  const atual = ref(null)
  const carregando = ref(false)
  const salvando = ref(false)
  const erro = ref(null)

  async function buscar(filtros = {}) {
    carregando.value = true
    erro.value = null
    try {
      lista.value = await api.pacientes.list(filtros)
    } catch (e) {
      erro.value = e.message
    } finally {
      carregando.value = false
    }
  }

  async function carregar(id) {
    if (atual.value?.id === id) return atual.value
    carregando.value = true
    erro.value = null
    try {
      atual.value = await api.pacientes.get(id)
      // Trilha de auditoria de acesso a dados de saúde (RNFSEG01).
      api.prontuario.registrarAcesso({
        pacienteId: id,
        usuarioId: 'med-1',
        acao: 'Visualização do prontuário',
        finalidade: 'Assistência à saúde',
      })
      return atual.value
    } catch (e) {
      erro.value = e.message
      return null
    } finally {
      carregando.value = false
    }
  }

  async function criar(paciente) {
    salvando.value = true
    try {
      const novo = await api.pacientes.create(paciente)
      lista.value = [...lista.value, novo].sort((a, b) => a.nome.localeCompare(b.nome))
      return novo
    } finally {
      salvando.value = false
    }
  }

  async function atualizar(id, alteracoes) {
    salvando.value = true
    try {
      const atualizado = await api.pacientes.update(id, alteracoes)
      const i = lista.value.findIndex((p) => p.id === id)
      if (i !== -1) lista.value[i] = atualizado
      if (atual.value?.id === id) atual.value = atualizado
      return atualizado
    } finally {
      salvando.value = false
    }
  }

  const total = computed(() => lista.value.length)

  return { lista, atual, carregando, salvando, erro, total, buscar, carregar, criar, atualizar }
})

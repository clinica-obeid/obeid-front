<script setup>
import { computed } from 'vue'
import Card from 'primevue/card'
import Tag from 'primevue/tag'
import ProgressSpinner from 'primevue/progressspinner'
import Accordion from 'primevue/accordion'
import AccordionPanel from 'primevue/accordionpanel'
import AccordionHeader from 'primevue/accordionheader'
import AccordionContent from 'primevue/accordioncontent'
import EmptyState from '@/components/common/EmptyState.vue'
import EyeBadge from '@/components/common/EyeBadge.vue'
import StatusTag from '@/components/common/StatusTag.vue'
import ExameVisualizacao from '@/components/exames/ExameVisualizacao.vue'
import { useProntuarioStore } from '@/stores/prontuario.js'
import { useCatalogosStore } from '@/stores/catalogos.js'
import { resumirExame, getExameSchema } from '@/mocks/exames/index.js'
import { formatarData, formatarDataHora, humanizarData } from '@/utils/formato.js'

/** Linha do tempo completa do paciente (RFHIS01). */
const prontuario = useProntuarioStore()
const catalogos = useCatalogosStore()

const grupos = computed(() => prontuario.timeline)

const totalRegistros = (g) =>
  g.exames.length + g.procedimentos.length + g.diagnosticos.length +
  g.prescricoes.length + (g.anamnese ? 1 : 0)

const TIPO_PRESCRICAO = {
  oculos: 'Receita de óculos',
  medicamentos: 'Receita de medicamentos',
  atestado: 'Atestado',
}
</script>

<template>
  <div v-if="prontuario.carregando" class="carregando"><ProgressSpinner style="width: 34px" /></div>

  <EmptyState
    v-else-if="!grupos.length"
    icone="pi-history"
    titulo="Sem histórico"
    descricao="Este paciente ainda não possui consultas registradas."
  />

  <div v-else class="linha">
    <article v-for="g in grupos" :key="g.consulta.id" class="evento">
      <div class="evento__marcador">
        <span class="evento__ponto" :class="{ 'evento__ponto--ativo': g.consulta.status !== 'finalizado' }" />
        <span class="evento__trilho" />
      </div>

      <Card class="evento__cartao">
        <template #title>
          <div class="evento__cab">
            <div>
              <span class="evento__data">{{ formatarData(g.consulta.data) }}</span>
              <span class="ob-muted ob-small"> · {{ humanizarData(g.consulta.data) }}</span>
            </div>
            <StatusTag v-if="!g.consulta.avulso" :status="g.consulta.status" />
            <Tag v-else value="Registro avulso" severity="secondary" icon="pi pi-paperclip" />
          </div>
        </template>

        <template #subtitle>
          <span class="ob-small ob-muted">
            {{ g.consulta.tipo }} · {{ g.consulta.motivo }}
            <template v-if="!g.consulta.avulso">
              · {{ catalogos.medico(g.consulta.medicoId)?.nome }}
              · {{ catalogos.sala(g.consulta.salaId)?.nome }}
            </template>
          </span>
        </template>

        <template #content>
          <p v-if="!totalRegistros(g)" class="ob-muted ob-small">Nenhum registro clínico nesta consulta.</p>

          <div v-else class="ob-stack">
            <section v-if="g.anamnese" class="bloco">
              <h4 class="bloco__titulo"><i class="pi pi-comment" /> Anamnese</h4>
              <p class="bloco__texto">{{ g.anamnese.queixaPrincipal }}</p>
              <p class="ob-small ob-muted">Tempo de sintomas: {{ g.anamnese.tempoSintomas }}</p>
            </section>

            <section v-if="g.exames.length" class="bloco">
              <h4 class="bloco__titulo"><i class="pi pi-eye" /> Exames ({{ g.exames.length }})</h4>
              <Accordion>
                <AccordionPanel v-for="e in g.exames" :key="e.id" :value="e.id">
                  <AccordionHeader>
                    <span class="exame__linha">
                      <i class="pi" :class="getExameSchema(e.tipo)?.icone" />
                      <strong>{{ getExameSchema(e.tipo)?.nome ?? e.tipo }}</strong>
                      <EyeBadge :olho="e.olho" />
                      <span class="ob-muted ob-small ob-truncate">{{ resumirExame(e) }}</span>
                    </span>
                  </AccordionHeader>
                  <AccordionContent>
                    <ExameVisualizacao :exame="e" />
                  </AccordionContent>
                </AccordionPanel>
              </Accordion>
            </section>

            <section v-if="g.procedimentos.length" class="bloco">
              <h4 class="bloco__titulo"><i class="pi pi-bolt" /> Procedimentos</h4>
              <ul class="lista">
                <li v-for="p in g.procedimentos" :key="p.id">
                  <EyeBadge :olho="p.olho" />
                  <span><strong>{{ p.nome }}</strong> — {{ p.descricao }}</span>
                </li>
              </ul>
            </section>

            <section v-if="g.diagnosticos.length" class="bloco">
              <h4 class="bloco__titulo"><i class="pi pi-tag" /> Diagnóstico e conduta</h4>
              <div v-for="d in g.diagnosticos" :key="d.id">
                <div class="ob-row-wrap">
                  <Tag v-for="c in d.cids" :key="c.codigo" :value="`${c.codigo} — ${c.descricao}`" severity="secondary" />
                </div>
                <p class="bloco__texto">{{ d.planoTerapeutico }}</p>
              </div>
            </section>

            <section v-if="g.prescricoes.length" class="bloco">
              <h4 class="bloco__titulo"><i class="pi pi-file-edit" /> Prescrições</h4>
              <ul class="lista">
                <li v-for="p in g.prescricoes" :key="p.id">
                  <Tag :value="TIPO_PRESCRICAO[p.tipo]" severity="contrast" />
                  <RouterLink :to="{ name: 'impressao', params: { prescricaoId: p.id } }" target="_blank">
                    visualizar documento
                  </RouterLink>
                </li>
              </ul>
            </section>
          </div>
        </template>
      </Card>
    </article>

    <section v-if="prontuario.acessos.length" class="auditoria">
      <h4 class="bloco__titulo"><i class="pi pi-shield" /> Registro de acessos a este prontuário</h4>
      <ul class="auditoria__lista ob-small ob-muted">
        <li v-for="a in prontuario.acessos.slice(0, 6)" :key="a.id">
          {{ formatarDataHora(a.data) }} — {{ catalogos.medico(a.usuarioId)?.nome ?? a.usuarioId }}
          · {{ a.acao }} · finalidade: {{ a.finalidade }}
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.carregando { display: grid; place-items: center; padding: 3rem; }

.linha { display: flex; flex-direction: column; }
.evento { display: grid; grid-template-columns: 22px 1fr; gap: 0.75rem; }
.evento__marcador { display: flex; flex-direction: column; align-items: center; padding-top: 1.1rem; }
.evento__ponto {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  background: var(--ob-marcador);
  flex-shrink: 0;
}
.evento__ponto--ativo { background: var(--p-primary-500); box-shadow: 0 0 0 3px var(--p-highlight-background); }
.evento__trilho { flex: 1; width: 2px; background: var(--p-content-border-color); }
.evento__cartao { margin-bottom: 1rem; }
.evento__cab { display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; flex-wrap: wrap; }
.evento__data { font-size: 1rem; font-weight: 600; }

.bloco { display: flex; flex-direction: column; gap: 0.35rem; }
.bloco__titulo {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color);
}
.bloco__texto { margin: 0.2rem 0 0; font-size: 0.875rem; line-height: 1.5; }

.exame__linha { display: flex; align-items: center; gap: 0.5rem; min-width: 0; flex: 1; }

.lista { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.35rem; font-size: 0.875rem; }
.lista li { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }

.auditoria {
  margin-left: 34px;
  padding: 0.75rem 1rem;
  border: 1px dashed var(--p-content-border-color);
  border-radius: var(--ob-radius);
}
.auditoria__lista { list-style: none; margin: 0.4rem 0 0; padding: 0; display: flex; flex-direction: column; gap: 0.2rem; }
</style>

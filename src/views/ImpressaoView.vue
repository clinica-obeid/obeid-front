<script setup>
import { computed, onMounted, ref } from 'vue'
import Button from 'primevue/button'
import ProgressSpinner from 'primevue/progressspinner'
import { api } from '@/services/api.js'
import { MEDICOS } from '@/mocks/catalogos.js'
import { formatarData, formatarExtenso, formatarGrau, idade } from '@/utils/formato.js'

/** Documento imprimível: receita de óculos, de medicamentos ou atestado. */
const props = defineProps({ prescricaoId: { type: String, required: true } })

const prescricao = ref(null)
const paciente = ref(null)
const carregando = ref(true)

const TITULOS = {
  oculos: 'Receita de Óculos',
  medicamentos: 'Receita Médica',
  atestado: 'Atestado Médico',
}

onMounted(async () => {
  prescricao.value = await api.prescricoes.get(props.prescricaoId)
  paciente.value = await api.pacientes.get(prescricao.value.pacienteId)
  carregando.value = false
  document.title = `${TITULOS[prescricao.value.tipo]} — ${paciente.value.nome}`
})

const medico = computed(() =>
  MEDICOS.find((m) => m.id === prescricao.value?.responsavelId) ?? MEDICOS[0])

const d = computed(() => prescricao.value?.dados ?? {})

const imprimir = () => window.print()
const fechar = () => window.close()
</script>

<template>
  <div v-if="carregando" class="carregando"><ProgressSpinner style="width: 40px" /></div>

  <div v-else class="pagina">
    <div class="acoes ob-no-print">
      <Button label="Imprimir" icon="pi pi-print" @click="imprimir" />
      <Button label="Fechar" icon="pi pi-times" text @click="fechar" />
      <span class="ob-muted ob-small">Documento de demonstração — sem validade legal.</span>
    </div>

    <article class="documento">
      <header class="doc__topo">
        <div>
          <strong class="doc__clinica">Clínica Oftalmológica Obeid</strong>
          <p class="doc__endereco">
            Rua das Acácias, 1200 — São Paulo/SP · (11) 3000-0000
          </p>
        </div>
        <span class="doc__logo"><i class="pi pi-eye" /></span>
      </header>

      <h1 class="doc__titulo">{{ TITULOS[prescricao.tipo] }}</h1>

      <section class="doc__paciente">
        <p><strong>Paciente:</strong> {{ paciente.nome }}</p>
        <p>
          <strong>Nascimento:</strong> {{ formatarData(paciente.dataNascimento) }}
          ({{ idade(paciente.dataNascimento) }} anos)
          <span class="doc__sep">·</span>
          <strong>CPF:</strong> {{ paciente.cpf }}
        </p>
      </section>

      <!-- RFPRE01 — receita de óculos -->
      <section v-if="prescricao.tipo === 'oculos'" class="doc__corpo">
        <p class="doc__finalidade">{{ d.finalidade }}</p>
        <table class="graus">
          <thead>
            <tr><th /><th>Esfera</th><th>Cilindro</th><th>Eixo</th><th>Adição</th></tr>
          </thead>
          <tbody>
            <tr v-for="lado in ['od', 'oe']" :key="lado">
              <th scope="row">{{ lado.toUpperCase() }}</th>
              <td>{{ formatarGrau(d[lado]?.esfera) }}</td>
              <td>{{ formatarGrau(d[lado]?.cilindro) }}</td>
              <td>{{ d[lado]?.eixo != null ? `${d[lado].eixo}°` : '—' }}</td>
              <td>{{ formatarGrau(d[lado]?.adicao) }}</td>
            </tr>
          </tbody>
        </table>
        <p v-if="d.dp"><strong>Distância pupilar:</strong> {{ d.dp }} mm</p>
        <p v-if="d.observacoes" class="doc__obs">{{ d.observacoes }}</p>
      </section>

      <!-- RFPRE02 — receita de medicamentos -->
      <section v-else-if="prescricao.tipo === 'medicamentos'" class="doc__corpo">
        <ol class="medicamentos">
          <li v-for="(item, i) in d.itens" :key="i">
            <strong>{{ item.medicamento }}</strong>
            <span class="medicamentos__uso">
              {{ item.olho === 'AO' ? 'Ambos os olhos' : item.olho === 'OD' ? 'Olho direito' : 'Olho esquerdo' }}
              — {{ item.posologia }}<template v-if="item.duracao"> · {{ item.duracao }}</template>
            </span>
          </li>
        </ol>
        <p v-if="d.orientacoes" class="doc__obs"><strong>Orientações:</strong> {{ d.orientacoes }}</p>
      </section>

      <!-- RFPRE03 — atestado -->
      <section v-else class="doc__corpo">
        <p class="doc__texto">{{ d.texto }}</p>
        <p v-if="d.incluirCid && d.cid">
          <strong>CID-10:</strong> {{ d.cid.codigo }} — {{ d.cid.descricao }}
        </p>
      </section>

      <footer class="doc__rodape">
        <p class="doc__data">São Paulo, {{ formatarExtenso(prescricao.data) }}.</p>
        <div class="doc__assinatura">
          <span class="doc__linha" />
          <strong>{{ medico.nome }}</strong>
          <span>{{ medico.crm }}</span>
        </div>
      </footer>
    </article>
  </div>
</template>

<style scoped>
.carregando { display: grid; place-items: center; padding: 4rem; }

.pagina { padding: 1.5rem; background: var(--ob-fundo); min-height: 100vh; }
.acoes { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem; }

.documento {
  max-width: 21cm;
  min-height: 25cm;
  margin: 0 auto;
  padding: 2.2cm 2cm;
  background: #fff;
  color: #111;
  box-shadow: 0 1px 12px rgb(0 0 0 / 12%);
  font-size: 12pt;
  line-height: 1.6;
}

.doc__topo {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding-bottom: 0.6rem;
  border-bottom: 2px solid #111;
}
.doc__clinica { font-size: 13pt; }
.doc__endereco { margin: 0.15rem 0 0; font-size: 9pt; color: #555; }
.doc__logo {
  display: grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  background: #1f8b85;
  color: #fff;
}

.doc__titulo { font-size: 15pt; text-align: center; margin: 1.6rem 0 1.2rem; letter-spacing: 0.04em; }

.doc__paciente p { margin: 0.15rem 0; font-size: 10.5pt; }
.doc__sep { margin: 0 0.4rem; color: #888; }

.doc__corpo { margin: 1.6rem 0; min-height: 8cm; }
.doc__finalidade { font-weight: 600; margin-bottom: 0.6rem; }
.doc__texto { text-align: justify; }
.doc__obs { margin-top: 1rem; font-size: 10.5pt; }

.graus { width: 100%; border-collapse: collapse; margin-bottom: 1rem; font-variant-numeric: tabular-nums; }
.graus th, .graus td { border: 1px solid #333; padding: 0.4rem 0.6rem; text-align: center; }
.graus thead th { background: #f1f1f1; font-size: 10pt; }
.graus tbody th { width: 60px; font-weight: 700; }

.medicamentos { padding-left: 1.2rem; }
.medicamentos li { margin-bottom: 0.9rem; }
.medicamentos__uso { display: block; font-size: 10.5pt; color: #333; }

.doc__rodape { margin-top: 2.5rem; }
.doc__data { text-align: right; font-size: 10.5pt; }
.doc__assinatura {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.1rem;
  margin: 2.5rem auto 0;
  width: 9cm;
  font-size: 10.5pt;
}
.doc__linha { width: 100%; border-top: 1px solid #111; margin-bottom: 0.3rem; }

@media print {
  .pagina { padding: 0; background: #fff; }
  .documento { box-shadow: none; margin: 0; padding: 1.5cm; min-height: auto; }
}
</style>

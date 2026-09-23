<script setup>
import { computed, ref } from 'vue'
import { formatarData } from '@/utils/formato.js'

/**
 * Evolução de uma medida por olho ao longo das consultas.
 *
 * Um único eixo de valor: OD e OE compartilham a mesma escala, que é o que
 * torna a comparação entre os olhos legítima. As cores são as mesmas usadas
 * nos rótulos de lateralidade em todo o sistema, e cada série é rotulada
 * diretamente — a identidade nunca depende só da cor.
 */
const props = defineProps({
  pontos: { type: Array, required: true }, // [{ data, od, oe }]
  titulo: { type: String, default: '' },
  unidade: { type: String, default: '' },
})

const L = 44, R = 46, T = 16, B = 26
const W = 620, H = 190

const ativo = ref(null)

const series = [
  { chave: 'od', rotulo: 'OD', cor: 'var(--ob-od)' },
  { chave: 'oe', rotulo: 'OE', cor: 'var(--ob-oe)' },
]

const valores = computed(() =>
  props.pontos.flatMap((p) => [p.od, p.oe]).filter((v) => typeof v === 'number'))

const escala = computed(() => {
  if (!valores.value.length) return { min: 0, max: 1 }
  const min = Math.min(...valores.value)
  const max = Math.max(...valores.value)
  const folga = (max - min || Math.abs(max) || 1) * 0.25
  return { min: min - folga, max: max + folga }
})

const x = (i) =>
  props.pontos.length < 2 ? (L + W - R) / 2 : L + (i * (W - L - R)) / (props.pontos.length - 1)

const y = (v) => {
  const { min, max } = escala.value
  return T + (1 - (v - min) / (max - min || 1)) * (H - T - B)
}

const caminho = (chave) =>
  props.pontos
    .map((p, i) => (typeof p[chave] === 'number' ? `${i === 0 ? 'M' : 'L'}${x(i)},${y(p[chave])}` : null))
    .filter(Boolean)
    .join(' ')

/** Três marcas de referência no eixo de valor — grade discreta, não decorativa. */
const marcas = computed(() => {
  const { min, max } = escala.value
  return [0, 0.5, 1].map((t) => {
    const v = min + t * (max - min)
    return { v, y: y(v), rotulo: Math.abs(max - min) < 3 ? v.toFixed(1) : Math.round(v) }
  })
})

const ultimo = computed(() => props.pontos.length - 1)

function aproximar(evento) {
  const svg = evento.currentTarget
  const caixa = svg.getBoundingClientRect()
  const px = ((evento.clientX - caixa.left) / caixa.width) * W
  let melhor = 0
  props.pontos.forEach((_, i) => {
    if (Math.abs(x(i) - px) < Math.abs(x(melhor) - px)) melhor = i
  })
  ativo.value = melhor
}
</script>

<template>
  <figure class="grafico">
    <figcaption v-if="titulo" class="grafico__titulo">
      {{ titulo }}
      <span v-if="unidade" class="ob-muted">({{ unidade }})</span>
    </figcaption>

    <svg
      :viewBox="`0 0 ${W} ${H}`"
      class="grafico__svg"
      role="img"
      :aria-label="`Evolução de ${titulo} por olho ao longo do tempo`"
      @mousemove="aproximar"
      @mouseleave="ativo = null"
    >
      <!-- grade de referência -->
      <g class="grafico__grade">
        <line v-for="m in marcas" :key="m.v" :x1="L" :x2="W - R" :y1="m.y" :y2="m.y" />
        <text v-for="m in marcas" :key="`t-${m.v}`" :x="L - 8" :y="m.y + 4" text-anchor="end">{{ m.rotulo }}</text>
      </g>

      <!-- datas -->
      <g class="grafico__datas">
        <text v-for="(p, i) in pontos" :key="i" :x="x(i)" :y="H - 8" text-anchor="middle">
          {{ formatarData(p.data).slice(0, 5) }}
        </text>
      </g>

      <!-- crosshair -->
      <line
        v-if="ativo !== null"
        class="grafico__crosshair"
        :x1="x(ativo)" :x2="x(ativo)" :y1="T" :y2="H - B"
      />

      <!-- séries -->
      <g v-for="s in series" :key="s.chave">
        <path :d="caminho(s.chave)" fill="none" :stroke="s.cor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        <template v-for="(p, i) in pontos" :key="i">
          <circle
            v-if="typeof p[s.chave] === 'number'"
            :cx="x(i)" :cy="y(p[s.chave])"
            :r="ativo === i ? 5.5 : 4"
            :fill="s.cor"
            stroke="var(--ob-superficie)"
            stroke-width="2"
          />
        </template>
        <!-- rótulo direto no último ponto: identidade sem depender da cor -->
        <text
          v-if="typeof pontos[ultimo]?.[s.chave] === 'number'"
          class="grafico__rotulo"
          :x="W - R + 8"
          :y="y(pontos[ultimo][s.chave]) + 4"
          :fill="s.cor"
        >{{ s.rotulo }} {{ pontos[ultimo][s.chave] }}</text>
      </g>
    </svg>

    <p v-if="ativo !== null" class="grafico__tooltip ob-small">
      <strong>{{ formatarData(pontos[ativo].data) }}</strong>
      <span v-for="s in series" :key="s.chave" class="grafico__item">
        <i class="grafico__ponto" :style="{ background: s.cor }" />
        {{ s.rotulo }}: {{ pontos[ativo][s.chave] ?? '—' }} {{ unidade }}
      </span>
    </p>
  </figure>
</template>

<style scoped>
.grafico { margin: 0; }

.grafico__titulo { font-size: 0.8125rem; font-weight: 600; margin-bottom: 0.25rem; }
.grafico__svg { width: 100%; height: auto; overflow: visible; }

.grafico__grade line { stroke: var(--p-content-border-color); stroke-width: 1; }
.grafico__grade text,
.grafico__datas text {
  font-size: 10px;
  fill: var(--p-text-muted-color);
  font-variant-numeric: tabular-nums;
}
.grafico__crosshair { stroke: var(--ob-marcador); stroke-width: 1; stroke-dasharray: 3 3; }
.grafico__rotulo { font-size: 11px; font-weight: 700; font-variant-numeric: tabular-nums; }

.grafico__tooltip {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 0.25rem 0 0;
  padding: 0.35rem 0.5rem;
  background: var(--ob-realce);
  border-radius: 6px;
}
.grafico__item { display: inline-flex; align-items: center; gap: 0.3rem; }
.grafico__ponto { width: 9px; height: 9px; border-radius: 50%; display: inline-block; }
</style>

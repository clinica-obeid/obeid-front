/**
 * Preset visual do sistema.
 *
 * Paleta clínica sóbria (teal/azul) sobre o preset Aura do PrimeVue, com
 * densidade reduzida — a interface é usada durante a consulta, em desktop e
 * tablet, onde ler rápido importa mais do que respiro visual (RNFUSA01/02).
 */
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

export const ObeidPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#eff9f8',
      100: '#d2efec',
      200: '#a6dfd9',
      300: '#6fc7bf',
      400: '#3ea9a1',
      500: '#1f8b85',
      600: '#16706c',
      700: '#125a58',
      800: '#104746',
      900: '#0d3a39',
      950: '#062120',
    },
    colorScheme: {
      light: {
        surface: {
          0: '#ffffff',
          50: '#f7f9fa',
          100: '#eef2f4',
          200: '#e2e8ec',
          300: '#cbd5dc',
          400: '#94a6b2',
          500: '#64798a',
          600: '#4a5c6b',
          700: '#374753',
          800: '#26333c',
          900: '#18222a',
          950: '#0d1519',
        },
        formField: {
          background: '#ffffff',
          borderColor: '#cbd5dc',
          paddingY: '0.5rem',
        },
        content: { borderColor: '#e2e8ec' },
      },
      dark: {
        surface: {
          0: '#ffffff',
          50: '#eef2f4',
          100: '#cbd5dc',
          200: '#94a6b2',
          300: '#64798a',
          400: '#4a5c6b',
          500: '#374753',
          600: '#26333c',
          700: '#1c262d',
          800: '#151d22',
          900: '#0f161a',
          950: '#0a0f12',
        },
        // O cinza médio da rampa é escuro demais sobre o fundo noturno:
        // o texto secundário sobe dois degraus para manter contraste legível.
        text: {
          color: '{surface.0}',
          mutedColor: '{surface.200}',
          hoverMutedColor: '{surface.100}',
        },
        content: { borderColor: '{surface.600}' },
        formField: { paddingY: '0.5rem', borderColor: '{surface.600}' },
      },
    },
  },
  components: {
    card: { body: { padding: '1.25rem' } },
    datatable: { headerCell: { padding: '0.6rem 0.75rem' }, bodyCell: { padding: '0.55rem 0.75rem' } },
  },
})

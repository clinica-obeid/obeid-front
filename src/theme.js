/**
 * Preset visual do sistema.
 *
 * A paleta é derivada das duas cores da clínica:
 *   azul primário       #12548D
 *   cinza-azulado claro #B2BDC6
 *
 * Os demais degraus foram gerados em OKLab a partir delas — matiz e croma
 * preservados, luminosidade percorrendo a escala do PrimeVue, com o croma
 * reduzido onde a cor sairia do gamut sRGB. As duas cores da marca aparecem
 * intactas nos degraus em que foram ancoradas (`primary.500` e `surface.300`),
 * que é onde o sistema realmente as exibe: botões e links no tema claro, e as
 * bordas e superfícies acinzentadas.
 *
 * A densidade é reduzida de propósito — a interface é usada durante a consulta,
 * em desktop e tablet, onde ler rápido importa mais do que respiro visual
 * (RNFUSA01/02).
 */
import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/** Azul da clínica: #12548D ancorado no degrau 500. */
const primary = {
  50: '#ebf3fb',
  100: '#d2e2f2',
  200: '#adc9e6',
  300: '#86b1dd',
  400: '#568dc6',
  500: '#12548d',
  600: '#0e4677',
  700: '#0b3962',
  800: '#072d4f',
  900: '#05233f',
  950: '#021427',
}

/** Cinza-azulado da clínica: #B2BDC6 ancorado no degrau 300. */
const surface = {
  0: '#ffffff',
  50: '#f2f8fc',
  100: '#e6eef5',
  200: '#d0dbe3',
  300: '#b2bdc6',
  400: '#8f9aa3',
  500: '#6c767e',
  600: '#4e5860',
  700: '#384148',
  800: '#262e34',
  900: '#171e23',
  950: '#0a0f13',
}

export const ObeidPreset = definePreset(Aura, {
  semantic: {
    primary,
    colorScheme: {
      light: {
        surface,
        // O degrau 500 fica em 4,33:1 sobre o fundo da página — pouco para
        // texto corrido, então o secundário desce um degrau (6,79:1).
        text: { mutedColor: '{surface.600}', hoverMutedColor: '{surface.700}' },
        formField: {
          background: '{surface.0}',
          borderColor: '{surface.300}',
          paddingY: '0.5rem',
        },
        content: { borderColor: '{surface.200}' },
      },
      dark: {
        surface,
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

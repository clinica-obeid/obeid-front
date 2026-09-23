<script setup>
import { useRoute } from 'vue-router'

defineEmits(['navegar'])

const route = useRoute()

const itens = [
  { to: { name: 'pacientes' }, rotulo: 'Pacientes', icone: 'pi-users' },
]

const ativo = (nome) => route.name === nome || String(route.name ?? '').startsWith(nome)
</script>

<template>
  <nav class="side">
    <RouterLink :to="{ name: 'pacientes' }" class="side__marca" @click="$emit('navegar')">
      <span class="side__logo"><i class="pi pi-eye" /></span>
      <span>
        <strong>Obeid</strong>
        <small class="ob-muted">Prontuário oftalmológico</small>
      </span>
    </RouterLink>

    <ul class="side__lista">
      <li v-for="item in itens" :key="item.rotulo">
        <RouterLink
          :to="item.to"
          class="side__item"
          :class="{ 'side__item--ativo': ativo(item.to.name) }"
          @click="$emit('navegar')"
        >
          <i class="pi" :class="item.icone" />
          <span>{{ item.rotulo }}</span>
        </RouterLink>
      </li>
    </ul>

    <p class="side__rodape ob-small ob-muted">
      Protótipo v0.1 · dados mockados
    </p>
  </nav>
</template>

<style scoped>
.side {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0.75rem;
}

.side__marca {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.5rem 0.5rem 1rem;
  text-decoration: none;
  color: inherit;
}
.side__marca strong { display: block; font-size: 1rem; }
.side__marca small { display: block; font-size: 0.7rem; }

.side__logo {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: var(--ob-radius);
  background: var(--p-primary-500);
  color: #fff;
  font-size: 1rem;
}

.side__lista {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.side__item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  min-height: 40px;
  padding: 0 0.75rem;
  border-radius: 8px;
  color: var(--p-text-color);
  text-decoration: none;
  font-weight: 500;
}
.side__item:hover { background: var(--ob-realce); }
.side__item--ativo {
  background: var(--p-highlight-background);
  color: var(--p-highlight-color);
}

.side__rodape { margin-top: auto; padding: 0.5rem; }
</style>

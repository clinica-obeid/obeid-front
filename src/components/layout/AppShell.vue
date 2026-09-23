<script setup>
import { onMounted, ref } from 'vue'
import Drawer from 'primevue/drawer'
import AppSidebar from './AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'
import { useCatalogosStore } from '@/stores/catalogos.js'

const menuAberto = ref(false)
const catalogos = useCatalogosStore()

onMounted(() => catalogos.carregar())
</script>

<template>
  <div class="shell">
    <p class="ob-demo-banner ob-no-print">
      <i class="pi pi-shield" />
      <span>
        <strong>Ambiente de demonstração.</strong>
        Todos os pacientes e dados clínicos são fictícios. Nenhuma informação é enviada a servidores.
      </span>
    </p>

    <div class="shell__body">
      <aside class="shell__sidebar ob-no-print">
        <AppSidebar />
      </aside>

      <Drawer v-model:visible="menuAberto" header="Menu" class="shell__drawer">
        <AppSidebar @navegar="menuAberto = false" />
      </Drawer>

      <div class="shell__main">
        <AppTopbar class="ob-no-print" @abrir-menu="menuAberto = true" />
        <main class="shell__content">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<style scoped>
.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.shell__body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.shell__sidebar {
  width: var(--ob-sidebar-w);
  flex-shrink: 0;
  border-right: 1px solid var(--p-content-border-color);
  background: var(--ob-superficie);
  overflow-y: auto;
}

.shell__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.shell__content {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

/* Abaixo de 1024px (tablet retrato) a navegação vira drawer — RNFUSA01. */
@media (max-width: 1023px) {
  .shell__sidebar { display: none; }
  .shell__content { padding: 1rem; }
}

@media print {
  .shell__sidebar { display: none; }
  .shell__content { padding: 0; overflow: visible; }
}
</style>

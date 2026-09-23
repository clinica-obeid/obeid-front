<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Toast from 'primevue/toast'
import ConfirmDialog from 'primevue/confirmdialog'
import AppShell from '@/components/layout/AppShell.vue'

const route = useRoute()
const semLayout = computed(() => route.meta.semLayout === true)
</script>

<template>
  <Toast position="bottom-right" />
  <ConfirmDialog />

  <RouterView v-if="semLayout" />
  <AppShell v-else>
    <RouterView v-slot="{ Component }">
      <component :is="Component" />
    </RouterView>
  </AppShell>
</template>

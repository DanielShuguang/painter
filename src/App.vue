<script setup lang="ts">
import { NConfigProvider, NDialogProvider, NMessageProvider, zhCN } from 'naive-ui'
import Layout from './components/Layout/Layout.vue'
</script>

<template>
  <NConfigProvider class="n-provider" :locale="zhCN">
    <NDialogProvider>
      <NMessageProvider>
        <Layout />
      </NMessageProvider>
    </NDialogProvider>
  </NConfigProvider>
</template>

<style lang="less">
html,
body {
  margin: 0;
  padding: 0;
  width: 100vw;
  height: 100vh;
}

.n-provider {
  height: 100%;
  width: 100%;
}

#app {
  width: 100%;
  height: 100%;
}
</style>

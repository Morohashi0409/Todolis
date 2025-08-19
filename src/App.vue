<template>
  <v-app>
    <v-main>
      <router-view />
    </v-main>
  </v-app>
</template>

<script setup lang="ts">
import { defineComponent } from 'vue'

defineComponent({
  name: 'App',
  setup() {
    // アプリケーション全体のロジック
    return {}
  }
})
</script>

<style src="./App.scss" lang="scss"></style>

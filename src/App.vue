<template>
  <div id="app">
    <!-- 全局背景叠层：网格与扫描线 -->
    <div class="grid-overlay" aria-hidden="true"></div>
    <div class="scanlines" aria-hidden="true"></div>

    <!-- PWA 安装提示 -->
    <PWAPrompt />

    <!-- 页面过渡容器 -->
    <RouterView v-slot="{ Component }">
      <transition name="page" mode="out-in">
        <component :is="Component" />
      </transition>
    </RouterView>
  </div>
</template>

<script setup lang="ts">
import PWAPrompt from '@/components/PWAPrompt.vue'
// App.vue 作为全局容器，提供页面过渡与背景叠层
</script>

<style>
/* 全局样式在 main.css 中定义 */
</style>

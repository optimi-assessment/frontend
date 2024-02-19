<template>
  <div class="root-container">
    <NavigationBar />
  </div>
</template>

<script setup>
import NavigationBar from '@/components/NavigationBar.vue';
</script>

<style scoped>
.root-container {
  width: '100%';
  height: '100%';
  background-image: linear-gradient(-20deg, #6e45e2 0%, #88d3ce 100%);
}
</style>

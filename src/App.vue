<template>
  <div class="root-container">
    <NavigationBar />
    <ui-grid class="grid">
      <ui-grid-cell columns="6">
        <div class="book-icon">
          📚 (oh, look books!)
        </div>
        <div class="big-text h1">
          Hi, this is the optimi <span class="text-highlight">assessment frontend</span>
        </div>
      </ui-grid-cell>
    </ui-grid>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NavigationBar from '@/components/NavigationBar.vue';

onMounted(() => {
  document.body.style.background = 'white';
});
</script>

<style scoped>
.book-icon {
  font-size: 35px;
  color: lightgray;
}
.grid {
  margin-top: 10%;
}
.big-text {
  color: gray;
  font-size: 46px;
  font-weight: bolder;
}
body.mdc-typography {
  background: white;
}
.root-container {
  width: 100%;
  height: 100%;
}
.text-highlight {
  color:rgb(112, 227, 188);
  font-weight: bolder;
}
</style>

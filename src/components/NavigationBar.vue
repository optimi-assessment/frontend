<template>
  <div class="page-top-app-bar">
    <ui-top-app-bar content-selector="#content-main" class="top-bar" :type="type" title="Sabelo Menu Search">
      <template #toolbar="{ toolbarItemClass }">
          <ui-menu-anchor>
            <ui-button :class="toolbarItemClass" @click="onOpen" raised>
              Go to projects
            </ui-button>
          </ui-menu-anchor>
        </template>
      </ui-top-app-bar>
    <SearchMenu
      :data="projectsData || []"
      :is-loading="isLoading || false"
      v-model="isMenuOpen"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import useProjects from '@/composables/useProjects';

import SearchMenu from './SearchMenu.vue';

const { isLoading, data: projectsData } = useProjects();

const isMenuOpen = ref(false);

const type = 1;
const onOpen = () => isMenuOpen.value = !isMenuOpen.value;
</script>

<style scoped>
.top-bar {
  top: 0;
  left: 0;
}
</style>

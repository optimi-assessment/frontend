<template>
    <div class="page-top-app-bar">
        <ui-top-app-bar
            class="top-bar"
            fixed content-selector="#content-main"
            :type="type"
            :title="title"
        >
            <template #toolbar="{ toolbarItemClass }">
                <ui-icon-button to="http//localhost" :class="toolbarItemClass" icon="file_download"></ui-icon-button>
                <ui-icon-button :class="toolbarItemClass" icon="print"></ui-icon-button>
                <ui-icon-button :class="toolbarItemClass" icon="bookmark"></ui-icon-button>
            </template>
        </ui-top-app-bar>
        <div id="content-main">
          <p v-for="i in 36" :key="i">Content {{ i }}</p>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const type = ref(0);
const title = ref('Hello BalmUI');
</script>

<style>
.top-bar {
  top: 0;
  left: 0;
}
</style>
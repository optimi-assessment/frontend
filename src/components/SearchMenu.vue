<!-- eslint-disable no-unused-vars -->
<template>
  <div>
  <ui-progress Indeterminate v-if="isLoading" />
  <nav v-if="model && !isLoading" class="list-container">
    <ui-textfield ref="textfield" class="input-search" outlined with-leading-icon v-model="searchQuery" :disabled="isLoading">
      <template #before>
        <ui-textfield-icon>search</ui-textfield-icon>
      </template>
      Search
    </ui-textfield>
    <div class="error" v-if="isError">
      Oops, please confirm the backend is running.
    </div>
    <ul v-for="(projectItem, projectIndex) in filteredData" :key="projectIndex">
      <li>
        <ui-grid
          @click="openUrl(projectItem.url)"
          :class="highlightProjectItem(projectIndex)"
          style="padding: 0px;"
        >
          <ui-grid-cell columns="3">
            <img :src="projectItem.image.link" :id="`header-${projectIndex}`" />
          </ui-grid-cell>
          <ui-grid-cell class="cell-header-text" columns="6">
            <h2 class="list-item-header" v-html="highlightText(projectItem.name)"></h2>
          </ui-grid-cell>
        </ui-grid>
        <ul>
          <li
            :class="highlightGroupItem(projectIndex, groupIndex)" :for="`subitem-${groupIndex}`"
            v-for="(group, groupIndex) in projectItem.groups"
            :key="groupIndex"
            @click="openUrl(group.url)"
          >
            <label class="subheader">
              <div class="list-item-subitem" v-html="highlightText(group.name)"></div>
            </label>
          </li>
        </ul>
      </li>
    </ul>
  </nav>
</div>
</template>

<script setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
} from 'vue';

const props = defineProps({
  data: {
    required: true,
    type: Array,
  },
  isError: {
    required: true,
    type: Boolean,
  },
  isLoading: {
    required: true,
    type: Boolean,
  },
});

const model = defineModel();

const textfield = ref(null);
const activeProjectIndex = ref(-1);
const activeGroupIndex = ref(-1);
const searchQuery = ref(null);

const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const setActiveProjectIndex = (index) => activeProjectIndex.value = index;
const setActiveGroupIndex = (index) => activeGroupIndex.value = index;
const resetActiveGroupIndex = () => activeGroupIndex.value = -1;
const resetActiveProjectIndex = () => activeProjectIndex.value = -1;
const resetSearchQuery = () => searchQuery.value = '';
const openUrl = (url) => window.location = url;

const resetSearchAndIndexes = () => {
  resetSearchQuery();
  resetActiveProjectIndex();
  resetActiveGroupIndex();
};

const onMenuClosed = () => {
  resetSearchAndIndexes();
};
const highlightProjectItem = (index) =>
  activeProjectIndex.value > -1 && index === activeProjectIndex.value && activeGroupIndex.value === -1 ? 'highlight' : '';

const highlightGroupItem = (projectIndex, groupIndex) =>
  activeProjectIndex.value === projectIndex && groupIndex === activeGroupIndex.value ? 'highlight' : '';

const highlightText = (text) => {
  if (!searchQuery.value) return text;
  const regex = new RegExp(escapeRegExp(searchQuery.value), 'gi');
  return text.replace(regex, (match) => `<b class="highlight-char">${match}</b>`);
};

const filteredData = computed(() => {
  if (!searchQuery.value) return props.data;

  const regex = new RegExp(escapeRegExp(searchQuery.value), 'gi');
  return props.data.map((item) => {
    const groupItems = item.groups.filter((groupItem) => groupItem.name.match(regex));
    if (groupItems.length || regex.test(item.name)) {
      return {
        ...item,
        groups: [...groupItems],
      };
    }
    return;
  }).filter((item) => !!item);
});

const isGroupItemHighlightActive = (direction) => {
  if (activeProjectIndex.value > - 1) {
    const { length: groupsLength } = filteredData.value[activeProjectIndex.value].groups;
    if (direction === 'down') {
      return groupsLength !== activeGroupIndex.value + 1;
    } else if (direction === 'up') {
      return (activeGroupIndex.value - 1) > -1;
    }
  }
  return false;
};

const highlightOnKeydown = (direction) => {
  if (!searchQuery.value && activeProjectIndex.value === -1) {
    if (direction === 'down') {
      setActiveProjectIndex(0);
    } else if (direction === 'up') {
      const lastProjectIndex = filteredData.value.length - 1;
      const lastGroupIndex = filteredData.value[lastProjectIndex].groups.length - 1;
      setActiveProjectIndex(lastProjectIndex);
      setActiveGroupIndex(lastGroupIndex);
    }
  }
}

const handleArrowKeys = (event) => {
  if (event.key === 'ArrowUp') {
    const isActive = isGroupItemHighlightActive('up');
    if (isActive) {
      setActiveGroupIndex(activeGroupIndex.value - 1);
    }
    else {
      if (activeGroupIndex.value === -1) {
        const nextProjectIndex = activeProjectIndex.value === 0 ? filteredData.value.length - 1 : activeProjectIndex.value - 1;
        if (nextProjectIndex > -1) {
          const nextProjectGroupIndex = filteredData.value[nextProjectIndex].groups.length - 1;
          setActiveProjectIndex(nextProjectIndex);
          setActiveGroupIndex(nextProjectGroupIndex);
        }
      } else {
        resetActiveGroupIndex();
      }
    }
    highlightOnKeydown('up');
  } else if (event.key === 'ArrowDown') {
    const isActive = isGroupItemHighlightActive('down');
    if (isActive) {
      setActiveGroupIndex(activeGroupIndex.value + 1);
    }
    else {
      resetActiveGroupIndex();
      if (filteredData.value.length > activeProjectIndex.value + 1) {
        setActiveProjectIndex(activeProjectIndex.value + 1);
      } else {
        setActiveProjectIndex(0);
      }
    }
    highlightOnKeydown('down');
  }
};

const addEnterEventListener = () =>
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      let url;
      if (activeGroupIndex.value > -1) {
        url = filteredData.value[activeProjectIndex.value].groups[activeGroupIndex.value].url;
      } else {
        url = filteredData.value[activeProjectIndex.value].url;
      }
      openUrl(url);
      resetSearchAndIndexes();
    }
  },
  );

const addArrowKeysEventListener = () => window.addEventListener('keydown', handleArrowKeys);
const removeKeydownEventListener = () => window.removeEventListener('keydown', handleArrowKeys);

onMounted(() => {
  document.querySelector('.mdc-icon-button').remove();
  addEnterEventListener();
  addArrowKeysEventListener();
});

onUnmounted(() => {
  removeKeydownEventListener();
});

watch(model, newV => {
  if (!newV) {
    onMenuClosed();
  }
  setTimeout(() => {
    document.querySelector('input[type="text"]').focus();
  }, 150);
});
watch(searchQuery, newV => {
  if (!newV) {
    resetSearchAndIndexes();
  } else {
    setActiveProjectIndex(0);
    resetActiveGroupIndex();
  }
})
</script>

<style scoped>
.error {
  font-weight: bold;
  color: gray;
  font-size: 15px;
  padding: 10px;
  border-radius: 5px;
  border: 2px solid lightgray;
}
.list-header:hover {
  cursor: pointer;
}
.cell-header-text {
  padding-top: 10px;
}
.subheader {
  height: 50px;
}
.list-item-header {
  font-size: 1.4rem;
  font-weight: bold;
}
.list-item-subitem {
  font-size: 1rem;
}
.input-search {
  width: 100%;
  margin-bottom: 10px;
}
body {
  background: linear-gradient(-20deg, #d0b785 20%, #a0cecf 80%);
  font-family: sans-serif;
}

ul {
  list-style: none; 
  margin: 0px;
  padding: 0px; 
}

.list-container {
  overflow: scroll;
  height: calc(100% - 200px);
  background-color: white;
  color: black;
  border: 1px solid white;
  border-radius: 5px;
  padding: 5px;
  height: 400;
  position: absolute;
  top: 10%;
  right: 20px;
  margin: 0px auto;
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
}

label {
  height: 69px;
  width: 100%;
  display: block;
  border-bottom: 1px solid lightgray;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  letter-spacing: 1px;
  position: relative;
  padding: 5px 5px 5px 5px;
  box-sizing:  border-box;
}

label h2 span{
  display: block;
  font-size: 11px;
  font-weight: normal;
  color: #bdc3c7;
}

img {
  width: 50px; /* Set a small width */
  height: 50px;
}

:deep(.highlight-char) {
  background-color: yellow;
  text-transform: inherit;
  font-weight: inherit;
}
.highlight {
  color: white;
  font-weight: bolder;
  background-color: #4e80de;
}
</style>

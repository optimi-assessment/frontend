<!-- eslint-disable no-unused-vars -->
<template>
  <div>
  <ui-progress Indeterminate v-if="isLoading" />
  <nav @blur="onMenuClosed" v-if="model && !isLoading" class="list-container">
    <ul v-for="(projectItem, projectIndex) in filteredData" :key="projectIndex">
      <li>
        <ui-grid :class="highlightProjectItem(projectIndex)" style="padding: 0">
          <ui-grid-cell :columns="{default: 3, tablet: 6, phone: 6}">
            <img :src="projectItem.image.link" :id="`header-${projectIndex}`" />
          </ui-grid-cell>
          <ui-grid-cell class="cell-header-text" :columns="{default: 6, tablet: 6, phone: 6}">
            <h2 class="list-item-header" v-html="highlightText(projectItem.name)"></h2>
          </ui-grid-cell>
        </ui-grid>
        <ul>
          <li
            :class="highlightGroupItem(projectIndex, groupIndex)" :for="`subitem-${groupIndex}`"
            v-for="(group, groupIndex) in projectItem.groups"
            :key="groupIndex"
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
  isLoading: {
    required: true,
    type: Boolean,
  },
});

const model = defineModel();

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
  console.log('close menu');
  resetSearchAndIndexes();
};
const highlightProjectItem = (index) =>
  activeProjectIndex.value > -1 && index === activeProjectIndex.value && activeGroupIndex.value === -1 ? 'highlight' : '';

const highlightGroupItem = (projectIndex, groupIndex) =>
  activeProjectIndex.value === projectIndex && groupIndex === activeGroupIndex.value ? 'highlight' : '';

const highlightText = (text) => {
  if (!searchQuery.value) return text;
  const regex = new RegExp(escapeRegExp(searchQuery.value), 'gi');
  return text.replace(regex, (match) => `<span class="highlight">${match}</span>`);
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
  background-color: white;
  color: black;
  width: 300px;
  border: 1px solid white;
  border-radius: 5px;
  padding: 5px;
  height: 400;
  position: absolute;
  top: 12%;
  right: 20px;
  margin: 0px auto;
}

label {
  height: 69px;
  width: 100%;
  display: block;
  border-bottom: 1px solid lightgray;
  font-size: 11px;
  font-weight: 900;
  cursor: pointer;
  text-transform: capitalize; 
  letter-spacing: 1px;
  position: relative;
  padding: 5px 5px 5px 80px;
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

.highlight {
  font-weight: bolder;
  background-color: #4e80de;
  color: white;
}
</style>

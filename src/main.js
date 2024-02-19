import './assets/main.css'

import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';


import BalmUI from 'balm-ui'; // Official Google Material Components
import BalmUIPlus from 'balm-ui-plus'; // BalmJS Team Material Components
import 'balm-ui-css';

const app = createApp(App);

app.use(VueQueryPlugin);
app.use(BalmUI);
app.use(BalmUIPlus);

app.mount('#app');

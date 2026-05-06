import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { i18n } from './i18n'
import { router } from './router'
import './styles/style.css'
import './styles/main.css'
import './styles/transitions.css'

createApp(App).use(createPinia()).use(router).use(i18n).mount('#app')

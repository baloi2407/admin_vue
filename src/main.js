import { createApp } from 'vue';
import App from './App.vue';
import router from './routes'
import './index.css'

router.afterEach((to) => {
    const title = to.meta.title || 'Vite App';
    document.title = title;
});
createApp(App).use(router).mount('#app')

import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'
import {post} from './api/https'

Vue.config.productionTip = false;
//定义全局变量
Vue.prototype.$post = post;
new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

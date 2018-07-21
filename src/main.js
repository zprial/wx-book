import Promise from 'bluebird';
import Vue from 'vue';
import App from './App';

Vue.config.productionTip = false;
App.mpType = 'app';

global.Promise = Promise;

const app = new Vue(App);
app.$mount();

export default {
  // 这个字段走 app.json
  config: {
    // 页面前带有 ^ 符号的，会被编译成首页，其他页面可以选填，我们会自动把 webpack entry 里面的入口页面加进去
    pages: [
      '^pages/index/main', // 主页
      'pages/search/main', // 搜索页
      'pages/history/main', // 历史页面
      'pages/details/main', // 书籍详情页
      'pages/chapter/main', // 章节详情页
      'pages/source/main', // 换源页面
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#4393e2',
      navigationBarTitleText: 'Deny阅读',
      navigationBarTextStyle: 'white',
    },
  },
};

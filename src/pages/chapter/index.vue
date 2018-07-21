<template>
  <div :class="['chapter-page', {nightMode: isNightMode}]">
    <rich-text class="chapter-content" @click="onPageClick" :nodes="chapterDetailsConver"/>
    <div class="turnPage">
      <div class="button last">上一章</div>
      <div class="button next">下一章</div>
    </div>
    <!-- 底部菜单 -->
    <ul :class="['chapter-footbar', { show: showFooterBar }]">
      <li @click="toggleNightOrDay">
        <i class="iconfont icon-sun" v-if="isNightMode"></i>
        <i class="iconfont icon-moon" v-else></i>
        <span>{{isNightMode? "白天" : "夜间"}}</span>
      </li>
      <!-- <li>
        <i class="iconfont icon-setting"></i>
        <span>设置</span>
      </li> -->
      <li @click="toggleCategoryList">
        <i class="iconfont icon-menu"></i>
        <span>目录</span>
      </li>
      <li @click="gotoSourcePage">
        <i class="iconfont icon-change"></i>
        <span>换源</span>
      </li>
    </ul>
    <!-- 目录 -->
    <div class="chapter-directory__wrap" v-if="showDirectory" @click="toggleCategoryList">
      <ol class="chapter-directory__list">
        <li v-for="(li, index) in directoryList.chapters" :class="{ active: false }" :key="index">{{li.title}}</li>
      </ol>
    </div>
  </div>
</template>

<script>
import { chapterDetails, directoryList } from '@/mock';

console.log('directoryList:', directoryList);
export default {
  data() {
    return {
      chapterDetails: chapterDetails.chapter, // 章节内容
      directoryList, // 目录
      showDirectory: false, // 是否展示目录
      showFooterBar: false, // 是否展示底部菜单
      isNightMode: false, // 是否是夜间模式
    };
  },
  computed: {
    chapterDetailsConver() {
      try {
        // 暂时想不到其他法子，先把\n|\r转成<p>标签
        return this.chapterDetails.cpContent.replace(/\n|\r/g, '<p>');
      } catch (e) {
        return '';
      }
    }
  },
  methods: {
    onPageClick() {
      // 切换底部显示
      this.showFooterBar = !this.showFooterBar;
    },
    // 切换目录
    toggleCategoryList() {
      this.showDirectory = !this.showDirectory;
    },
    // 切换夜间/白天模式
    toggleNightOrDay() {
      this.isNightMode = !this.isNightMode;
    },
    // 跳转换源页面
    gotoSourcePage(query) {
      wx.navigateTo({
        url: `/pages/source/main?query=${query}`
      });
    }
  },
  onShow() {
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#333333',
      animation: {
        duration: 150,
        timingFunc: 'easeIn'
      }
    });
  }
};
</script>

<style lang="scss">
.chapter-page{
  background-color: #EFE6DF;
  height: 100vh;
  padding: 15px 15px 0;
  box-sizing: border-box;
  position: relative;
  overflow: auto;
  font-size: 14px;
  // 夜间模式
  &.nightMode{
    background: #333;
		.chapter-content{
			color: #777;
		}
  }
}
.chapter-content{
  line-height: 1.75;
  text-indent: 2em;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}
// 翻页按钮
.turnPage{
  padding: 30px 0 20px;
  display: flex;
  justify-content: space-between;
  .button{
    background-color: transparent;
    flex: 1;
    border-radius: 30px;
    border: 1px solid #999;
    color: #666;
    outline: none;
    font-size: 14px;
    text-align: center;
    padding: 6px 0;
    &.next{
      flex: 1.8;
      margin-left: 20px;
    }
  }
}
// 底部菜单
.chapter-footbar{
  position: fixed;
  bottom: 0;
  left: 0;
  right:0;
  background-color: #333;
  color: #fff;
  display: flex;
  align-items: center;
  transition: transform .3s ease;
  transform: translateY(100%);
  &.show{
    transform: translateY(0);
  }
  li {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    .iconfont{
      margin-bottom: 5px;
    }
  }
}
// 目录
.chapter-directory{
  &__wrap{
    position: fixed;
    left:0;
    right:0;
    bottom:0;
    top: 0;
    background: rgba(#000, .25);
  }
  &__list{
    position: absolute;
    top: 45%;
    max-height: 70vh;
    background-color: #fff;
    border-radius: 4px;
    width: 85%;
    padding: 15px 10px;
    left: 50%;
    transform: translate(-50%, -50%);
    overflow: auto;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 6px, rgba(0, 0, 0, 0.12) 0px 1px 4px;
    li{
      margin: 5px 0 8px;
      &:not(:last-child){
        padding-bottom: 8px;
        border-bottom: 1px solid #e5e5e5;
      }
      &.active{
        color: #4393e2;
      }
    }
  }
}

</style>

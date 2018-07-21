<template>
  <div :class="['chapter-page', {nightMode: isNightMode}]">
    <rich-text class="chapter-content" @click="onPageClick" :nodes="chapterDetailsConver" :style="{fontSize: chapterFontSize + 'px'}"/>
    <div class="turnPage" v-show="chapterDetailsConver">
      <div class="button last" @click="gotoTargeChapter(currentPageIndex - 1)" v-if="currentPageIndex > 0">上一章</div>
      <div class="button next" @click="gotoTargeChapter(currentPageIndex + 1)" v-if="chapterListData.chapters && currentPageIndex < chapterListData.chapters.length - 1">下一章</div>
    </div>
    <!-- 底部菜单 -->
    <div :class="['chapter-footbar', { show: showFooterBar }]">
      <ul>
        <li @click="gotoHome" v-if="fromOtherPlace">
          <i class="iconfont icon-home"></i>
          <span>书架</span>
        </li>
        <li @click="toggleNightOrDay">
          <i class="iconfont icon-sun1" v-if="isNightMode"></i>
          <i class="iconfont icon-moon" v-else></i>
          <span>{{isNightMode? "白天" : "夜间"}}</span>
        </li>
        <li @click="toggleSettingPanel">
          <i class="iconfont icon-setting"></i>
          <span>设置</span>
        </li>
        <li @click="toggleCategoryList">
          <i class="iconfont icon-menu"></i>
          <span>目录</span>
        </li>
        <li @click="gotoSourcePage(chapterListData._id)">
          <i class="iconfont icon-change"></i>
          <span>换源</span>
        </li>
      </ul>
      <!-- 设置面板 -->
      <div class="setting-panel" v-show="showFooterBar && showSettingPanel">
        <!-- 亮度调节面板 -->
        <div class="lightness setting-panel-normal">
          <i class="iconfont icon-sun"></i>
          <slider min="0" max="1" :value="lightness" step="0.05" color="#f5f5f5" activeColor="#4393e2" block-size="14" @changing="changeLightNess" @change="changeLightNess"/>
        </div>
        <!-- 字体大小调节面板 -->
        <div class="font-size setting-panel-normal">
          <i class="iconfont icon-ziti"></i>
          <slider min="12" max="30" :value="chapterFontSize" step="1" color="#f5f5f5" activeColor="#4393e2" block-size="14" @change="changeFontSize"/>
        </div>
      </div>
    </div>
    <!-- 目录 -->
    <div class="chapter-picker__wrap" v-if="showDirectory" @click="toggleCategoryList">
      <div class="chapter-picker" @click.stop>
        <picker-view indicator-style="height: 50px;" :value="[currentPageIndexTmp]" @change="changeCurrentIndexTmp">
          <picker-view-column>
            <view class="chapter-picker-item" v-for="(chapter, index) in chapterListData.chapters" @click="gotoTargeChapter(index)" :key="chapter.id">{{chapter.title}}</view>
          </picker-view-column>
        </picker-view>
        <slider min="0" show-value :max="chapterListData.chapters.length-1" :value="currentPageIndexTmp" step="1" color="#999999" activeColor="#4393e2" block-size="14" @change="changeCurrentIndexTmp"/>
      </div>
    </div>
  </div>
</template>

<script>
// /pages/chapter/main?from=share&bookId=${书籍ID}&sourceId=${书源ID}&chapterIndex=${章节号}
import store from '@/store';
import { CHAPTER_FONT_SIZE } from '@/utils/constants';
import { keepUsefulAttributeInArray, getImgSrc } from '@/utils';

// 临时变量,书源
let _currentSource = null;

export default {
  data() {
    return {
      fromOtherPlace: false, // 是否从其他地方跳转过来
      showDirectory: false, // 是否展示目录
      showFooterBar: false, // 是否展示底部菜单
      isNightMode: false, // 是否是夜间模式
      currentPageIndex: 0, // 当前查看第几章
      currentPageIndexTmp: 0, // 当前查看第几章，给目录用的，不是真实的第几章
      bookInBookCase: null, // 书籍对应的书架的内容
      lightness: 0, // 亮度
      showSettingPanel: false, // 是否展示设置面板
      chapterFontSize: 14, // 默认字体大小
    };
  },
  computed: {
    // 书架内容
    bookCase() {
      return store.state.bookCase;
    },
    // 书籍详情
    bookDetails() {
      return store.state.bookDetails;
    },
    // 章节目录
    chapterListData() {
      const { chapterListData } = store.state;
      // 只保留必要的属性，减少数据量
      chapterListData.chapters = keepUsefulAttributeInArray(chapterListData.chapters, ['_index', 'link', 'title', 'id']);
      return chapterListData;
    },
    // 书籍对应的书架的内容
    bookInBookCase() {
      const { bookId } = this.$root.$mp.query;
      return this.bookCase.find(book => book._id === bookId);
    },
    // 书源
    sourceList() {
      return store.state.sourceList;
    },
    // 章节内容
    chapterDetails() {
      return store.state.chapterDetails;
    },
    // 章节内容转换
    chapterDetailsConver() {
      try {
        // 暂时想不到其他法子，先把\n|\r转成<p>标签
        return (this.chapterDetails.cpContent || this.chapterDetails.body).replace(/\n|\r/g, '<p>');
      } catch (e) {
        return '';
      }
    }
  },
  watch: {
    showFooterBar(value) {
      if (!value) {
        this.showSettingPanel = false;
      }
    },
    currentPageIndex(value) {
      this.currentPageIndexTmp = value;
    }
  },
  methods: {
    // 回首页
    gotoHome() {
      wx.redirectTo({
        url: '/pages/index/main'
      });
    },
    // 跳转哪一章
    gotoTargeChapter(index) {
      this.showDirectory = false;
      this.showFooterBar = false;
      this.currentPageIndex = +index;
      // 先清空章节内容
      store.dispatch('resetChapterDetails');
      const chapter = this.chapterListData.chapters[index];
      if (chapter) {
        chapter._index = index;
        store.dispatch('fetchChapterDetails', chapter.link).then(() => {
          wx.pageScrollTo({
            scrollTop: 0,
            duration: 300
          });
        });
        // 更改titleBar文案
        wx.setNavigationBarTitle({
          title: chapter.title
        });
        if (this.bookInBookCase) {
          store.dispatch('addToBookCase', {
            ...this.bookInBookCase,
            currentChapter: chapter,
            __order: false // 倒序插入
          });
        }
      }
    },
    // 更改临时章节数
    changeCurrentIndexTmp(e) {
      const { value } = e.target;
      if (Array.isArray(value)) {
        this.currentPageIndexTmp = value[0]; // eslint-disable-line
      } else if (typeof value === 'number') {
        this.currentPageIndexTmp = value;
      }
    },
    onPageClick() {
      // 切换底部显示
      this.showFooterBar = !this.showFooterBar;
    },
    // 切换目录
    toggleCategoryList() {
      this.showDirectory = !this.showDirectory;
      // 如果隐藏了，就重置临时位置
      if (!this.showDirectory) {
        this.currentPageIndexTmp = this.currentPageIndex;
      }
    },
    // 切换夜间/白天模式
    toggleNightOrDay() {
      this.isNightMode = !this.isNightMode;
    },
    // 切换设置面板
    toggleSettingPanel() {
      this.showSettingPanel = !this.showSettingPanel;
    },
    // 跳转换源页面
    gotoSourcePage(bookId) {
      this.showFooterBar = false;
      // 如果没有加入书架，不允许换源
      if (!this.bookInBookCase) {
        wx.showToast({
          title: '加入书架才能换源哦~',
          icon: 'none',
          duration: 2000
        });
      } else {
        wx.navigateTo({
          url: `/pages/source/main?bookId=${bookId}`
        });
      }
    },
    // 改变亮度
    changeLightNess(e) {
      const { value } = e.target;
      if (typeof value === 'number') {
        this.lightness = value;
        wx.setScreenBrightness({ value });
      }
    },
    // 改变字体大小
    changeFontSize(e) {
      const { value } = e.target;
      if (typeof value === 'number') {
        this.chapterFontSize = value;
        wx.setStorage({
          key: CHAPTER_FONT_SIZE,
          data: value
        });
      }
    }
  },
  onLoad() {
    // 更改titleBar标题
    wx.setNavigationBarColor({
      frontColor: '#ffffff',
      backgroundColor: '#333333',
      animation: {
        duration: 150,
        timingFunc: 'easeIn'
      }
    });
    // 获取屏幕亮度
    wx.getScreenBrightness({
      success: ({ value }) => {
        if (typeof value === 'number') {
          this.lightness = value;
        }
      }
    });
    // 获取之前设置的字体大小
    wx.getStorage({
      key: CHAPTER_FONT_SIZE,
      success: ({ data }) => {
        this.chapterFontSize = data;
      }
    });
    // 获取书架数据
    store.dispatch('getBookCase');
    const { from } = this.$root.$mp.query;
    // 如果是从其他地方跳转过来的，比如，分享页
    if (from) {
      this.fromOtherPlace = true;
    }
  },
  onShow() {
    const {
      bookId,
      sourceId,
      chapterIndex,
      from
    } = this.$root.$mp.query;
    this.bookInBookCase = this.bookCase.find(book => book._id === bookId);
    const bookInBookCase = this.bookInBookCase; // eslint-disable-line
    if (bookId) {
      store.dispatch('fetchBookSource', bookId)
        .then((result) => {
          // 默认拿第一个书源
          let source = result[0];
          // 如果是从分享页进来的
          if (from === 'share' && sourceId) {
            source = result.find(r => r._id === sourceId) || source;
          } else if (bookInBookCase && bookInBookCase.currentSource) {
            source = bookInBookCase.currentSource;
          }
          // 只在当前页面临时保存书源
          _currentSource = source;
          return store.dispatch('fetchChapterList', source._id);
        }).then((result) => {
          // 默认第一章
          let chapter = result.chapters[0];
          /* eslint-disable */
          // 如果是从分享页进来的
          if (from === 'share' && chapterIndex) {
            this.currentPageIndex = +chapterIndex;
            chapter = result.chapters[+chapterIndex];
          }
          // 如果已收藏，本地有数据的话
          else if (bookInBookCase && bookInBookCase.currentChapter && bookInBookCase.currentChapter._index) {
            let { _index } = bookInBookCase.currentChapter;
            // 如果之前的章节比现在书源的总章节还要大, 则最大不能超过该书源的总章节
            if (_index > result.chapters.length - 1) {
              _index = result.chapters.length - 1;
            }
            this.currentPageIndex = _index;
            chapter = result.chapters[_index];
          }
          /* eslint-enable */
          // 更改titleBar文案
          wx.setNavigationBarTitle({
            title: chapter.title
          });
          store.dispatch('fetchChapterDetails', chapter.link);
        });
    }
  },
  onHide() {
    this.showDirectory = false;
    this.showFooterBar = false;
  },
  // 分享
  onShareAppMessage() {
    const { title, _id, cover } = this.bookInBookCase || this.bookDetails;
    return {
      title: `${title} - ${this.chapterDetails.title}——Deny阅读`,
      path: `/pages/chapter/main?from=share&bookId=${_id}&sourceId=${_currentSource._id}&chapterIndex=${this.currentPageIndex}`,
      imageUrl: getImgSrc(cover)
    };
  }
};
</script>

<style lang="scss">
.chapter-page{
  background-color: #EFE6DF;
  height: 100vh;
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
  padding: 15px 15px 0;
  line-height: 1.75;
  text-indent: 2em;
  min-height: 80vh;
  color: #333;
  width: 100%;
  box-sizing: border-box;
  display:block;
  word-wrap: break-word;
}
// 翻页按钮
.turnPage{
  padding: 30px 15px 20px;
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
  transition: transform .3s ease;
  transform: translateY(100%);
  &.show{
    transform: translateY(0);
  }
  > ul {
    display: flex;
    align-items: center;
    position: relative;
    z-index: 100;
    padding-top: 5px;
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
// 设置面板
.setting-panel{
  position: absolute;
  bottom: 100%;
  left: 0;
  right: 0;
  background-color: #333;
  padding: 1px 20px;
  border-bottom: 1px solid #4e4e4e;
  .setting-panel-normal{
    padding: 5px 0;
    display: flex;
    align-items: center;
    slider{
      flex: 1;
    }
  }
}
// 目录
.chapter-picker{
  position: fixed;
  bottom: 0;
  left:0;
  width: 100%;
  background-color: #fff;
  z-index: 200;
  height: 300px;
  picker-view{
    height: 300px;
  }
  slider{
    position: absolute;
    left: 47%;
    bottom: 10px;
    width: 80%;
    transform-origin: center center;
    transform: translateX(-50%);
    z-index: 10;
  }
  &__wrap{
    position: fixed;
    left:0;
    right:0;
    bottom:0;
    top: 0;
    background: rgba(#000, .25);
  }
  &-item{
    line-height: 50px;
    padding: 0 20px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}
</style>

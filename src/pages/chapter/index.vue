<template>
  <div :class="['chapter-page', {nightMode: isNightMode}]">
    <rich-text class="chapter-content" @click="onPageClick" :nodes="chapterDetailsConver" :style="{fontSize: chapterFontSize + 'px'}"/>
    <div class="turnPage" v-show="chapterDetailsConver">
      <div class="button last" @click="gotoTargeChapter(currentPageIndex - 1)" v-if="currentPageIndex > 0">上一章</div>
      <div class="button next" @click="gotoTargeChapter(currentPageIndex + 1)" v-if="currentPageIndex < chaptersSectionCount - 1">下一章</div>
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
        <li @click="gotoSourcePage(chapterListDataId)">
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
          <div >
            <span style="margin-right: 10px;">常亮</span>
            <switch type="checkbox" :checked="isKeepLight" @change="toggleScreenLight"></switch>
          </div>
        </div>
        <!-- 字体大小调节面板 -->
        <div class="font-size setting-panel-normal">
          <i class="iconfont icon-ziti"></i>
          <slider min="12" max="30" :value="chapterFontSize" step="1" color="#f5f5f5" activeColor="#4393e2" block-size="14" @change="changeFontSize"/>
        </div>
      </div>
    </div>
    <!-- 目录 -->
    <section :class="['chapter-picker', { showDirectory }]" @click="toggleCategoryList">
      <header @click.stop>
        <h3>目录(共{{chaptersSectionCount}}章)</h3>
        <picker :range="chapterSectionArray" @change="chapterSectionArrayChange" :value="currentChapterSectionIndex">
          <span class="picker">{{chapterSectionArray[currentChapterSectionIndex]}} <i class="iconfont icon-dropDown"></i></span>
        </picker>
      </header>
      <ul @click.stop>
        <li
          :key="item.id"
          :class="{active: (currentChapterSectionIndex * CHAPTER_SECTION_COUNT) + index === currentPageIndex}"
          v-for="(item, index) in currentChapterSection"
          @click="gotoTargeChapterFromItem(item, index)"
        >{{item.title}}</li>
      </ul>
      <button>关闭</button>
    </section>
  </div>
</template>

<script>
// /pages/chapter/main?from=share&bookId=${书籍ID}&sourceId=${书源ID}&chapterIndex=${章节号}
import store from '@/store';
import isEqual from 'lodash/isEqual';
import _chunk from 'lodash/chunk';
import _get from 'lodash/get';
import { CHAPTER_FONT_SIZE, SCREEN_IS_LIGHT, CHAPTER_SECTION_COUNT } from '@/utils/constants';
import { keepUsefulAttributeInArray, getImgSrc } from '@/utils';

// 临时变量,书源
let _currentSource = null;
// 临时变量,保存页面onHide之前的数据，与onShow之后做对比，如果一直就不重新获取
let _lastChapter = null;
// 保存章节数据，不放在data中，防止数据过大，造成卡顿
let _chapterListData = {
  chapters: []
};
// 保存章节分段数据
let _chaptersSection = [];

export default {
  data() {
    return {
      CHAPTER_SECTION_COUNT,
      fromOtherPlace: false, // 是否从其他地方跳转过来
      showDirectory: false, // 是否展示目录
      showFooterBar: false, // 是否展示底部菜单
      isNightMode: false, // 是否是夜间模式
      currentPageIndex: 0, // 当前查看第几章
      bookInBookCase: null, // 书籍对应的书架的内容
      lightness: 0, // 亮度
      showSettingPanel: false, // 是否展示设置面板
      chapterFontSize: 14, // 默认字体大小
      isKeepLight: false, // 屏幕是否保持常亮
      currentChapterSectionIndex: 0, // 当前处在章节分段第几段
      chapterListDataId: 0, // 章节ID
      chaptersSectionCount: 0, // 章节数量
      currentChapterSection: [], // 当前查看的章节段落
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
    },
    // 章节目录分段范围
    // ['1-100','101-200',....]
    chapterSectionArray() {
      const totalArrayCount = Math.ceil(this.chaptersSectionCount / CHAPTER_SECTION_COUNT);
      return Array.from({ length: totalArrayCount }).map((section, index) => `${(index * CHAPTER_SECTION_COUNT) + 1} - ${Math.min((index + 1) * CHAPTER_SECTION_COUNT, this.chaptersSectionCount)}`);
    },
  },
  watch: {
    showFooterBar(value) {
      if (!value) {
        this.showSettingPanel = false;
      }
    },
    isKeepLight(value) {
      wx.setKeepScreenOn({
        keepScreenOn: value
      });
    },
    // 监听showDirectory变化，需要重新计算currentChapterSectionIndex，并还原
    showDirectory(value) {
      // 只在展示的时候还原
      if (value) {
        this.currentChapterSectionIndex = Math.floor(this.currentPageIndex / CHAPTER_SECTION_COUNT);
      } else {
        // 只在关闭的时候隐藏底部操作栏
        this.showFooterBar = false;
      }
    },
    // 监听当前章节段落序号，改变章节段落
    currentChapterSectionIndex(value) {
      this.currentChapterSection = _chaptersSection[value];
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
      const chapter = _chapterListData.chapters[index];
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
    gotoTargeChapterFromItem(item, index) {
      // 计算将要跳往哪一章
      // eslint-disable-next-line
      const targetChapterIndex = (this.currentChapterSectionIndex * CHAPTER_SECTION_COUNT) + Number(index);
      this.gotoTargeChapter(targetChapterIndex);
    },
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
    },
    // 保持屏幕常亮
    toggleScreenLight(e) {
      const { value } = e.target;
      this.isKeepLight = value;
      wx.setStorage({
        key: SCREEN_IS_LIGHT,
        data: value
      });
    },
    // 章节序列切换区间
    chapterSectionArrayChange(e) {
      this.currentChapterSectionIndex = e.target.value;
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
    // 是否常亮
    wx.getStorage({
      key: SCREEN_IS_LIGHT,
      success: ({ data }) => {
        this.isKeepLight = data;
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
    // 如果重新进来的时候，当前小说是否跟hide之前一致的，一致就不重新获取
    // 什么时候不一致？当更改书源的时候
    if (_lastChapter && isEqual(bookInBookCase, _lastChapter)) {
      return;
    }
    _lastChapter = bookInBookCase;
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
          _chapterListData = result;
          // 只保留必要的属性，减少数据量
          _chapterListData.chapters = keepUsefulAttributeInArray(_chapterListData.chapters, ['_index', 'link', 'title', 'id']);
          // 给章节分段
          _chaptersSection = _chunk(_chapterListData.chapters, CHAPTER_SECTION_COUNT);
          this.currentChapterSection = _chaptersSection[this.currentChapterSectionIndex];
          // 章节ID
          this.chapterListDataId = _chapterListData._id;
          // 章节数量
          this.chaptersSectionCount = _chapterListData.chapters.length;

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
    const {
      title,
      _id,
      cover
    } = this.bookInBookCase || this.bookDetails;
    let chapterTitle = _get(this.chapterDetails, 'title');
    // 有的小说获取到的title是字符串的点.，此时拿书架保存的当前章节的title
    if (chapterTitle.length <= 1) {
      chapterTitle = _get(_chapterListData.chapters[this.currentPageIndex], 'title');
    }
    return {
      title: `${title} - ${chapterTitle}——Deny阅读`,
      path: `/pages/chapter/main?from=share&bookId=${_id}&sourceId=${_currentSource._id}&chapterIndex=${this.currentPageIndex}`,
      imageUrl: getImgSrc(cover)
    };
  },
  onUnload() {
    this.showDirectory = false;
    this.showFooterBar = false;
    this.currentPageIndex = 0;
    this.currentChapterSectionIndex = 0;
    _currentSource = null;
    _lastChapter = null;
  }
};
</script>

<style lang="scss">
$primaryColor: #4393e2;
.chapter-page{
  background-color: #EFE6DF;
  height: 100vh;
  box-sizing: border-box;
  position: relative;
  overflow: auto;
  font-size: 14px;
  .changeSourceButton{
    position: absolute;
    left: 50%;
    top: 50%;
    width: auto;
    transform: translate(-50%, -50%);
    padding: 2px 20px;
    color: #fff;
    background-color: $primaryColor;
    font-size: 14px;
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
    &.lightness>div{
      display: inline-flex;
      align-items: center;
    }
  }
}
// 目录
.chapter-picker{
  color: #333;
  position: fixed;
  left:0;
  right:0;
  bottom:0;
  top: 0;
  background: #fff;
  overflow: auto;
  transform: translate3d(-100%, 0, 0);
  transition: transform .3s ease;
  display: flex;
  flex-direction: column;
  header {
    display: flex;
    justify-content: space-between;
    padding: 10px;
    box-shadow: 0 0 10px rgba(#333, .375);
    .picker{
      display: inline-flex;
      align-items: center;
    }
    .icon-dropDown{
      font-size: 12px;
      margin-left: 5px;
    }
  }
  &> ul{
    flex: 1;
    overflow: auto;
    li {
      padding: 10px 20px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      &.active{
        color: #fff;
        background-color: rgba($primaryColor, .75);
      }
    }
  }
  &.showDirectory{
    transform: translate3d(0, 0, 0);
  }
  > button{
    width: 100%;
    background-color: $primaryColor;
    outline: none;
    border-radius: 0;
    border: 0;
    font-size: 14px;
    color: #fff;
    padding: 5px 0;
    box-shadow: 0 0 10px rgba($primaryColor, .375);
  }
}
// 主题调整
.chapter-page{
  // 夜间模式
  &.nightMode{
    background: #333;
		.chapter-content{
			color: #777;
		}
    .chapter-picker{
      background: #333;
      header,
      > ul {
        color: #666;
      }
      li.active{
        color: $primaryColor;
        background-color: transparent;
      }
    }
  }
}
</style>

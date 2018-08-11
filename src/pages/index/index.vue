
<template>
  <div class="home-page">
    <div :class="['refresh-bar', {show: refreshing}]">
      <i></i>
      <i></i>
      <i></i>
    </div>
    <BookItem
      v-for="(item, index) in bookList"
      :key="index"
      :title="item.title"
      :content="`${formatTime(item.updated)}：${item.lastChapter}`"
      :cover="getImgSrc(item.cover)"
      :hasUpdated="item._hasUpdated"
      @click="gotoChapterPage(item._id)"
      @longpress="removeBook(item)"
    />
    <div class="home-add" @click="gotoSearchPage">
      <i class="iconfont icon-add"></i>
      <span>添加你喜欢的小说</span>
    </div>
  </div>
</template>
<script>
import BookItem from '@/components/BookItem';
import { getImgSrc, formatTime } from '@/utils';
import store from '@/store';

export default {
  data() {
    return {
      refreshing: false, // 是否在刷新
    };
  },
  components: {
    BookItem,
  },
  computed: {
    // 书架列表
    bookList() {
      return store.state.bookCase;
    }
  },
  methods: {
    formatTime,
    getImgSrc,
    // 跳转搜索历史页
    gotoSearchPage() {
      wx.navigateTo({
        url: '/pages/history/main'
      });
    },
    // 跳转详情页面
    gotoChapterPage(bookId) {
      wx.navigateTo({
        url: `/pages/chapter/main?bookId=${bookId}`
      });
      store.dispatch('confirmUpdate', bookId);
    },
    // 从书架移除
    removeBook(book) {
      wx.showModal({
        title: '提示',
        content: `确认从书架移除 ${book.title} ?`,
        success(res) {
          if (res.confirm) {
            store.dispatch('removeFromBookCase', book._id);
          }
        }
      });
    },
  },
  // 下拉刷新的时候查询有无更新
  async onPullDownRefresh() {
    this.refreshing = true;
    const ids = this.bookList.map(book => book._id) || [];
    await store.dispatch('fetchBookUpdate', ids.join(','));
    this.refreshing = false;
    wx.stopPullDownRefresh();
  },
  onLoad() {
    store.dispatch('getBookCase');
    setTimeout(() => {
      if (this.bookList && this.bookList.length >= 1) {
        wx.startPullDownRefresh();
      }
    }, 500);
  }
};
</script>

<style lang="scss" scoped>
@keyframes loading{
  0%{
    transform: scale(0);
  }
  100%{
    transform: scale(1);
  }
}
.refresh-bar {
  position: fixed;
  top: 0;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  display: none;
  &.show{
    display: flex;
  }
  i {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #999;
    margin: 0 5px;
    @for $i from 1 through 3 {
      &:nth-of-type(#{$i}){
        animation: loading .5s ease #{$i * .3s} infinite alternate;
      }
    }
  }
}
.home-page{
  padding: 0 10px;
}
.home-add{
  display: flex;
  align-items: center;
  height: 54px;
  color: #333;
  font-size: 16px;
  .iconfont{
    margin: 0 20px 0 17px;
  }
  span{
    color: #333;
  }
}
</style>

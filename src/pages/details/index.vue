<template>
  <div class="detail-page">
    <div class="detail-header">
      <image class="book-cover" mode="aspectFill" :src="bookDetailsConver" />
      <div class="detail-header__inner">
        <h5>{{bookDetails.title}}</h5>
        <p class="p2">
          <em @click="gotoSearchPage(bookDetails.author)">{{bookDetails.author}}</em>
          <span v-if="bookDetails.minorCate">&nbsp;|&nbsp;{{bookDetails.minorCate}}</span>
          <span>&nbsp;|&nbsp;{{wordCount}}字</span>
        </p>
        <p class="p3">{{updatedTime}}</p>
      </div>
      <div class="detail-header__cooperation">
        <button @click="gotoChapterPage(bookDetails._id)">开始阅读</button>
        <button @click="afterMore(bookDetails._id)" v-if="!isAddToBookCase">+追更新</button>
      </div>
    </div>
    <ul class="detail-staes">
      <li>
        <p>追更人数</p>
        <span>{{bookDetails.latelyFollower}}</span>
      </li>
      <li>
        <p>读者存留率</p>
        <span>{{bookDetails.retentionRatio}}%</span>
      </li>
      <li>
        <p>日更新字数</p>
        <span>{{bookDetails.serializeWordCount}}</span>
      </li>
    </ul>
    <div class="detail-introduce" v-if="bookDetails.longIntro">
      <h5>简介</h5>
      <div class="container">
        <rich-text :nodes="longIntroConver"/>
      </div>
    </div>
    <div class="detail-likes" v-if="booksLike.length > 0">
      <h5>猜你喜欢</h5>
      <scroll-view scroll-x style="width: 100%">
        <div class="like-item" @click="gotoDetailsPage(book._id)" v-for="(book, index) in booksLikeConver" :key="index">
          <image lazy-load class="book-cover" mode="aspectFill" :src="book.cover" />
          <p>{{book.title}}</p>
        </div>
      </scroll-view>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { getImgSrc, formatTime } from '@/utils';

export default {
  data() {
    return {
      a: 1
    };
  },
  methods: {
    getImgSrc,
    formatTime,
    // 跳转搜索页面
    gotoSearchPage(query = '') {
      wx.navigateTo({
        url: `/pages/search/main?search=${query}`
      });
    },
    // 跳转章节页
    gotoChapterPage(bookId = '') {
      wx.navigateTo({
        url: `/pages/chapter/main?bookId=${bookId}`
      });
    },
    // 跳转详情页,同一个页面不能跳转？
    // 用的同一实例？
    // 数据会变掉？
    gotoDetailsPage(bookId) {
      if (bookId) {
        wx.navigateTo({
          url: `/pages/details/main?bookId=${bookId}`
        });
      }
    },
    // 获取详情及推荐
    getBookDetails(bookId) {
      store.dispatch('fetchBookDetails', bookId);
      store.dispatch('fetchBookLikes', bookId);
    },
    // 追更，加入书柜
    async afterMore(bookId) {
      // 获取书源
      const sources = await store.dispatch('fetchBookSource', bookId);
      // 默认第一个书源，查章节目录
      if (Array.isArray(sources) && sources.length > 0) {
        const currentSource = sources[0];
        const { chapters } = await store.dispatch('fetchChapterList', currentSource._id);
        // 默认第一章节
        if (Array.isArray(chapters) && chapters.length > 0) {
          const currentChapter = chapters[0];
          store.dispatch('addToBookCase', {
            ...this.bookDetails,
            currentSource,
            currentChapter
          });
          wx.showToast({
            title: '已添加至书架',
            icon: 'success',
            duration: 1500
          });
        }
      }
    }
  },
  computed: {
    // 书籍详情
    bookDetails() {
      return store.state.bookDetails;
    },
    // 猜你喜欢
    booksLike() {
      return store.state.booksLike;
    },
    // 字数
    wordCount() {
      const count = this.bookDetails.wordCount;
      if (count > 10000) {
        return `${Math.ceil(count / 10000)}万`;
      }
      return count;
    },
    // 更新时间
    updatedTime() {
      return formatTime(this.bookDetails.updated);
    },
    // 封面转过之后的数据(mpvue不支持在 template 内使用 methods 中的函数，尴尬)
    bookDetailsConver() {
      return getImgSrc(this.bookDetails.cover);
    },
    // 猜你喜欢数据封面转换
    booksLikeConver() {
      return this.booksLike.map(book => ({
        ...book,
        cover: getImgSrc(book.cover)
      }));
    },
    // 简介转换
    longIntroConver() {
      try {
        // 暂时想不到其他法子，先把\n|\r转成<p>标签
        return (this.bookDetails.longIntro || '').replace(/\n|\r/g, '<p>');
      } catch (e) {
        return '';
      }
    },
    // 书架
    bookCase() {
      return store.state.bookCase;
    },
    // 是否被加入到书架了
    isAddToBookCase() {
      return this.bookCase.findIndex(book => book._id === this.bookDetails._id) !== -1;
    }
  },
  onLoad() {
    const { bookId } = this.$root.$mp.query;
    if (bookId) {
      this.getBookDetails(bookId);
    }
    // 如果没有书架数据的话，就去获取
    if (this.bookCase.length === 0) {
      store.dispatch('getBookCase');
    }
  },
  // 分享
  onShareAppMessage() {
    return {
      title: `好友向你推荐了一本好书——${this.bookDetails.title}`,
      path: `/pages/details/main?bookId=${this.bookDetails._id}`,
      imageUrl: this.bookDetailsConver
    };
  }
};
</script>

<style lang="scss" scoped>
.book-cover{
  width: 48px;
  height: 64px;
}
.detail-header{
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  background-color: #4393e2;
  padding: 5px 10px 10px;
  color: #fff;
  .book-cover{
    margin-right: 10px;
  }
  &__inner{
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    h5{
      font-size: 14px;
      font-weight: 400;
      margin: 5px 0 6px;
    }
    em {
      color: #f07a0c;
    }
    .p2{
      display: flex;
      margin: 5px 0;
    }
  }
  &__cooperation{
    button{
      width: 6em;
      height: 30px;
      line-height: 30px;
      font-size: 14px;
      border-radius: 5px;
      background: #fff;
      color: #333;
      border: 0;
      text-align: center;
      &:first-child{
        margin-bottom: 5px;
      }
    }
  }
}
.detail-introduce,
.detail-likes,
.detail-staes{
  padding: 15px 0;
  margin: 0 10px;
  font-size: 14px;
  color: #333;
}

.detail-staes{
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  text-align: center;
  font-size: 14px;
  border-bottom: 1px solid #eee;
  li{
    flex: 1;
    text-align: center;
    &:not(:last-child){
      border-right: 1px solid #eee;
    }
    p{
      color: #666;
    }
  }
}
.detail-introduce,
.detail-likes{
  h5 {
    border-left: 3px solid #4393e2;
    padding-left: 5px;
    line-height: 1;
    margin-bottom: 10px;
  }
}
.detail-introduce{
  .container{
    padding-left: 10px;
    text-indent: 1em;
  }
}
.detail-likes{
  white-space: nowrap;
  .like-item{
    display: inline-block;
    font-size: 12px;
    width: 48px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    margin: 0 5px;
  }
}
</style>

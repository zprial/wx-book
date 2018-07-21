<template>
  <div class="search-page">
    <!-- 搜索 -->
    <SearchBar
      focus
      @search="onSearch"
    />
    <!-- 搜索结果 -->
    <div class="search-list">
      <BookItem
        v-for="(book, index) in searchList"
        :key="index"
        :title="book.title"
        :content="`${book.latelyFollower}人在追 | ${book.retentionRatio}%读者存留 | ${book.author}著`"
        :cover="getImgSrc(book.cover)"
        @click="gotoDetailPage"
      />
    </div>
  </div>
</template>

<script>
import uniq from 'lodash/uniq';
import SearchBar from '@/components/SearchBar';
import BookItem from '@/components/BookItem';
import { getImgSrc } from '@/utils';
import { HISTORY_WORDS } from '@/utils/constants';
import { bookList } from '@/mock';

export default {
  data() {
    return {
      searchList: bookList.books, // 搜索列表数据
      searchValue: '', // 搜索关键词
    };
  },
  components: {
    BookItem,
    SearchBar
  },
  methods: {
    getImgSrc,
    // 搜索
    onSearch(e) {
      const { value } = e.target;
      if (value) {
        // 搜索关键词。。。
        // 。。。
        this.historyWords.unshift(value);
        wx.setStorage({
          key: HISTORY_WORDS,
          data: JSON.stringify(uniq(this.historyWords))
        });
      }
    },
    // 跳转详情页面
    gotoDetailPage(query) {
      wx.navigateTo({
        url: `/pages/details/main?query=${query}`
      });
    }
  },
  onLoad() {
    console.log(this.$root.$mp.query);
  }
};
</script>

<style lang="scss" scoped>
.search-page{
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.search-list{
  padding: 0 20px;
  flex: 1;
  height: 0;
  overflow: auto;
}
</style>

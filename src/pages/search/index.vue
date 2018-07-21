<template>
  <div class="search-page">
    <!-- 搜索 -->
    <SearchBar
      :focus="!searchValue"
      :value="searchValue"
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
        @click="gotoDetailPage(book._id)"
      />
    </div>
  </div>
</template>

<script>
import SearchBar from '@/components/SearchBar';
import BookItem from '@/components/BookItem';
import { getImgSrc } from '@/utils';
import store from '@/store';

export default {
  data() {
    return {
      searchValue: '', // 搜索关键词
    };
  },
  components: {
    BookItem,
    SearchBar
  },
  computed: {
    // 搜索列表数据
    searchList() {
      return store.state.searchList;
    }
  },
  methods: {
    getImgSrc,
    // 搜索
    onSearch(value) {
      if (value) {
        this.searchValue = value;
        store.dispatch('addNewSearchHistory', value);
        store.dispatch('fetchSearchList', value);
      }
    },
    // 跳转详情页面
    gotoDetailPage(bookId) {
      wx.navigateTo({
        url: `/pages/details/main?bookId=${bookId}`
      });
    }
  },
  onLoad() {
    const { search } = this.$root.$mp.query;
    if (search) {
      this.searchValue = search;
      this.onSearch(search);
    }
  },
  onUnload() {
    // 重置数据
    // this.searchValue = '';
    // store.dispatch('resetSearchPageList');
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

<template>
  <div class="source-page">
    <div class="source-item" v-for="(source, index) in formatTimeSourceList" :key="index" @click="changeSource(source)">
      <h5>{{source.name}}</h5>
      <p>{{source.updateTime}}：{{source.lastChapter}}</p>
      <span class="tip" v-if="(bookInBookCase && bookInBookCase.currentSource && bookInBookCase.currentSource._id === source._id) || (!bookInBookCase && index === 0)">当前选择</span>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { formatTime } from '@/utils';

export default {
  computed: {
    // 书架内容
    bookCase() {
      return store.state.bookCase;
    },
    // 章节目录
    chapterListData() {
      return store.state.chapterListData;
    },
    // 书籍对应的书架的内容
    bookInBookCase() {
      return this.bookCase.find(book => book._id === this.chapterListData.book);
    },
    // 书源
    sourceList() {
      return store.state.sourceList;
    },
    // 这里只是把时间转了下，尴尬
    formatTimeSourceList() {
      return this.sourceList.map(source => ({
        ...source,
        updateTime: formatTime(source.updated)
      }));
    }
  },
  methods: {
    // 换源
    changeSource(source) {
      if (this.bookInBookCase) {
        store.dispatch('addToBookCase', {
          ...this.bookInBookCase,
          currentSource: source
        });
      }
      wx.navigateBack({
        delta: 1
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.source-item{
  position: relative;
  padding: 15px 10px;
  border-bottom: 1px solid #e5e5e5;
  > h5{
    font-size: 14px;
    font-weight: bold;
    margin-bottom: 5px;
  }
  > p{
    font-size: 12px;
  }
  .tip{
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 12px;
    background-color: #ccc;
    color: #fff;
    padding: 3px 6px;
    border-radius: 3px;
  }
}
</style>

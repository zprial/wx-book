<template>
  <div class="history-page">
    <!-- 搜索 -->
    <SearchBar readonly @click="gotoSearchPage"/>
    <!-- 其他内容 -->
    <div class="history-container">
      <div class="history-title">
        <span>大家都在搜</span>
        <span @click="changeHotWords"><i class="iconfont icon-refresh" /> 换一批</span>
      </div>
      <ul class="history-hotwords">
        <li v-for="(item, index) in hotWords" :key="index" @click="gotoSearchPage(item.word)">{{item.word}}</li>
      </ul>
      <div class="history-title">
        <span>搜索历史</span>
        <span @click="clearSearchHistory"><i class="iconfont icon-trash" /> 清 空</span>
      </div>
      <ul class="history-list">
        <li v-for="(item, index) in historyWords" :key="index"><i class="iconfont icon-history"></i> {{item}}</li>
      </ul>
    </div>
  </div>
</template>

<script>
import sampleSize from 'lodash/sampleSize';
import SearchBar from '@/components/SearchBar';
import { hotWords } from '@/mock';
import { HISTORY_WORDS } from '@/utils/constants';

export default {
  data() {
    return {
      totalHotWords: hotWords.newHotWords, // 所有热门关键词
      hotWords: [], // 热门关键词
      historyWords: [], // 历史搜索关键词
    };
  },
  components: {
    SearchBar,
  },
  methods: {
    // 更换热门关键词
    changeHotWords() {
      this.hotWords = sampleSize(this.totalHotWords, 8); // 随机八个
    },
    // 清空本地搜索记录
    clearSearchHistory() {
      wx.removeStorage({
        key: HISTORY_WORDS,
        success: () => {
          this.historyWords = [];
          wx.showToast({
            title: '清空成功',
            icon: 'success'
          });
        }
      });
    },
    // 跳转搜索页面
    gotoSearchPage(query = '') {
      wx.navigateTo({
        url: `/pages/search/main?query=${query}`
      });
    }
  },
  created() {
    this.changeHotWords();
    // 获取本地存储的搜索历史
    wx.getStorage({
      key: HISTORY_WORDS,
      success: (res) => {
        const result = JSON.parse(res.data);
        this.historyWords = result;
      }
    });
  }
};
</script>

<style lang="scss" scoped>
.history-page{
  height: 100vh;
  display: flex;
  flex-direction: column;
}
.history-container {
  padding: 10px 20px;
  flex: 1;
  height: 0;
  overflow: scroll;
  font-size: 12px;
}

// 区域头
.history-title{
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  span{
    color: #333;
    display: inline-flex;
    align-items: center;
  }
  .iconfont{
    margin-right: 5px;
    font-size: 14px;
  }
}

// 关键词
.history-hotwords{
  max-height: 98px;
  overflow: hidden;
  margin-bottom: 20px;
  $colors: (#03a9f4, #f589f5, #f74d5b, #f5a15d, #935df5, #5cd2f2, #c1f559, #919);
  li {
    display: inline-block;
    padding: 5px 10px;
    color: #fff;
    border-radius: 4px;
    margin: 0 10px 10px 0;
    @for $i from 1 through length($colors){
      &:nth-of-type(#{$i}) {
        background-color: nth($colors, $i);
      }
    }
  }
}

// 搜索历史
.history-list{
  color: #333;
  li {
    display: flex;
    align-items: center;
    padding: 8px 0;
    .iconfont{
      margin-right: 10px;
    }
  }
}
</style>

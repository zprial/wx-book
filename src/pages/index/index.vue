
<template>
  <div class="home-page">
    <BookItem
      v-for="(item, index) in bookList"
      :key="index"
      :title="item.title"
      :content="`${item.latelyFollower}人在追 | ${item.retentionRatio}%读者存留 | ${item.author}著`"
      :cover="getImgSrc(item.cover)"
      @click="gotoDetailPage"
    />
    <div class="home-add" @click="gotoSearchPage">
      <i class="iconfont icon-add"></i>
      <span>添加你喜欢的小说</span>
    </div>
  </div>
</template>
<script>
import BookItem from '@/components/BookItem';
import { getImgSrc } from '@/utils';
import { bookList } from '@/mock';

export default {
  data() {
    return {
      bookList: [bookList.books[0]], // 书架列表
      refreshing: false, // 是否在刷新
    };
  },
  components: {
    BookItem,
  },
  methods: {
    getImgSrc,
    // 跳转搜索历史页
    gotoSearchPage() {
      wx.navigateTo({
        url: '/pages/history/main'
      });
    },
    // 跳转详情页面
    gotoDetailPage(query) {
      wx.navigateTo({
        url: `/pages/details/main?query=${query}`
      });
    }
  },
  // 下拉刷新的时候查询有无更新
  async onPullDownRefresh() {
    setTimeout(() => {
      wx.stopPullDownRefresh();
    }, 2000);
  }
};
</script>

<style lang="scss" scoped>
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

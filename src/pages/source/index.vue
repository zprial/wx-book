<template>
  <div class="source-page">
    <div class="source-item" v-for="(source, index) in formatTimeSourceList" :key="index">
      <h5>{{source.name}}</h5>
      <p>{{source.updateTime}}：{{source.lastChapter}}</p>
      <span class="tip">当前选择</span>
    </div>
  </div>
</template>

<script>
import { sourceList } from '@/mock';
import { formatTime } from '@/utils';

export default {
  data() {
    return {
      sourceList: sourceList || [] // 书源
    };
  },
  computed: {
    // 这里只是把时间转了下，尴尬
    formatTimeSourceList() {
      return this.sourceList.map(source => ({
        ...source,
        updateTime: formatTime(source.updated)
      }));
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

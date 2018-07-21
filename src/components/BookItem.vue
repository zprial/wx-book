<template>
    <div class="book-item" @click="onClick">
      <image class="book-item_cover" mode="aspectFill" :src="cover" />
      <div class="book-item_body">
        <text class="book-item_title">{{title}}</text>
        <text class="book-item_text">{{content}}</text>
      </div>
      <slot></slot>
    </div>
</template>

<script>
export default {
  props: ['title', 'content', 'cover'],
  methods: {
    onClick() {
      this.$emit('click');
    }
  }
};
</script>
<style lang="scss">
// 一本书
.book-item {
  display: flex;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #d9d9d9;
  // 书籍封面
  &_cover {
    width: 48px;
    height: 64px;
    margin-right: 10px;
  }
  // 标题
  &_title {
    font-size: 14px;
    display: block;
    margin: 5px 0 10px;
  }
  &_text {
    font-size: 12px;
    color: #666;
    display: block;
  }
}
</style>

<template>
    <div class="book-item" @click="onClick" @longpress="onLongpress">
      <image class="book-item_cover" mode="aspectFill" :src="cover" />
      <div class="book-item_body">
        <text class="book-item_title">{{title}}</text>
        <text class="book-item_text">{{content}}</text>
      </div>
      <i class="update-tip" v-if="hasUpdated" />
      <slot></slot>
    </div>
</template>

<script>
export default {
  props: ['title', 'content', 'cover', 'hasUpdated'],
  methods: {
    onClick() {
      this.$emit('click');
    },
    onLongpress() {
      this.$emit('longpress');
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
  .update-tip{
    position: absolute;
    right: 20px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #4393e2;
  }
}
</style>

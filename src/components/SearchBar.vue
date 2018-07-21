<template>
  <div class="search-bar" @click="onClick">
    <i class="iconfont icon-search"></i>
    <input
      type="text"
      confirm-type="search"
      class="search-input"
      :placeholder="placeholder"
      :disabled="readonly"
      :focus="focus"
      :value="value"
      @confirm="onSearch"
    />
  </div>
</template>

<script>
  export default {
    props: {
      placeholder: {
        type: String,
        default: '输入书名或者作者名'
      },
      readonly: {
        type: Boolean,
        default: false
      },
      focus: {
        type: Boolean,
        default: false
      },
      value: {
        type: String
      }
    },
    methods: {
      onSearch(e) {
        this.$emit('search', e.target.value);
      },
      onClick(e) {
        this.$emit('click', e);
      }
    }
  };
</script>

<style lang="scss" scoped>
.search-bar{
  background-color: #4393e2;
  padding: 10px 20px 12px;
  position: relative;
  .search-input{
    background-color: #fff;
    border-radius: 40px;
    padding: 5px 10px 5px 35px;
    font-size: 14px;
    color: #666;
  }
  .icon-search{
    position: absolute;
    left: 30px;
    top: 50%;
    transform: translateY(-55%);
    color: #999;
  }
}
</style>


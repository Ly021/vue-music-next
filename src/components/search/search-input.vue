<template>
  <div class="search-input">
    <i class="icon-search"></i>
    <input
    class="input-inner"
    v-model="query"
    :placeholder="placeholder"
    >
    <i class="icon-dismiss"
    v-show="query"
    @click="clear"
    >
    </i>
  </div>
</template>

<script>
  import { debounce } from 'throttle-debounce'
  export default {
    name: 'search-input',
    props: {
      modelValue: String,
      placeholder: {
        type: String,
        default: '搜索歌曲、歌手'
      }
    },
    data() {
      return {
        query: this.modelValue
      }
    },
    created() {
      this.$watch('query', debounce(300, (newQuery) => {
        this.$emit('update:modelValue', newQuery.trim())
        // trim()用于移除字符串两端的空白字符（空格、制表符、换行符等）。这个方法返回一个新字符串，新字符串是原始字符串的副本，但两端的空白字符被删除。
      }))

      this.$watch('modelValue', (newVal) => {
        this.query = newVal
      })
    },
    methods: {
      clear() {
        this.query = ''
      }
    }
  }
</script>

<style lang="scss" scoped>
  .search-input {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    padding: 0 6px;
    height: 32px;
    background: $color-highlight-background;
    border-radius: 6px;
    .icon-search {
      font-size: 24px;
      color: $color-text-d;
    }
    .input-inner {
      flex: 1;
      margin: 0 5px;
      line-height: 18px;
      background: $color-highlight-background;
      color: $color-text;
      font-size: $font-size-medium;
      outline: 0;
      &::placeholder {
        color: $color-text-d;
      }
    }
    .icon-dismiss {
      font-size: 16px;
      color: $color-text-d;
    }
  }
</style>

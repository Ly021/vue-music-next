<template>
<!-- 做一个提示框，升级交互功能，在点击歌曲之后能够弹出提示添加歌曲成功 -->
  <teleport to="body">
    <transition name="slide-down">
      <div class="message" v-show="visible" @click="hide">
        <slot></slot>
      </div>
    </transition>
  </teleport>
</template>
<script>
  export default {
    name: 'message',
    data() {
      return {
        visible: false
      }
    },
    props: {
      delay: {
        type: Number,
        default: 2000
      }
    },
    methods: {
      show() {
        this.visible = true
        clearTimeout(this.timer)
        // 创建定时器之前先clear掉，否则会遗留多个定时器
        this.timer = setTimeout(() => {
          this.hide()
        }, this.delay)
      },
      hide() {
        clearTimeout(this.timer)
        this.visible = false
      }
    }
  }
</script>
<style lang="scss" scoped>
  .message {
    position: fixed;
    top: 0;
    width: 100%;
    z-index: 400;
    background: $color-dialog-background;
    &.slide-down-enter-active, &.slide-down-leave-active {
      transition: all 0.3s
    }

    &.slide-down-enter-from, &.slide-down-leave-to {
      transform: translate3d(0, -100%, 0)
    }
  }
</style>

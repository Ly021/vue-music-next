<!-- 开发音乐播放进度栏 -->
<template>
  <div
    class="progress-bar"
    @click="onClick"
  >
    <div class="bar-inner">
      <div
        class="progress"
        ref="progress"
        :style="progressStyle"
      ></div>
      <div
        class="progress-btn-wrapper"
        :style="btnStyle"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend.prevent="onTouchEnd"
      >
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  const progressBtnWidth = 16

  export default {
    name: 'progress-bar',
    emits: [
      'progress-changing', 'progress-changed'
    ],
    props: {
      progress: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        offset: 0
      }
    },
    computed: {
      progressStyle() {
        return `width:${this.offset}px`
      },
      btnStyle() {
        return `transform: translate3d(${this.offset}px, 0, 0)`
      }
    },
    watch: {
      progress(newProgress) {
        this.setOffset(newProgress)
        // 与miniplayer联通时，如果在miniplayer点击播放时，style会出现获取宽度bug，所以需要再fallScreen为ture的时候去重新获取进度条
        // offset重新更新，模板也会重新渲染
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      onTouchStart(e) {
        this.touch.x1 = e.touches[0].pageX
        // 将触摸事件获得的pageX赋值给x1，[0]用于访问第一个触摸点
        this.touch.beginWidth = this.$refs.progress.clientWidth
        // 获取左侧黄色进度条宽度
      },
      onTouchMove(e) {
        const delta = e.touches[0].pageX - this.touch.x1
        // 相对于初始位置偏移了多少
        const tempWidth = this.touch.beginWidth + delta
        // 位移后进度条的宽度
        const barWidth = this.$el.clientWidth - progressBtnWidth
        // 整个进度条宽度
        const progress = Math.min(1, Math.max(tempWidth / barWidth, 0))
        // 拖动过后的进度
        this.offset = barWidth * progress
        // offset映射进度条style
        this.$emit('progress-changing', progress)
        // 用于派发一个手指滑动过程的监听事件
      },
      onTouchEnd() {
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = this.$refs.progress.clientWidth / barWidth
        this.$emit('progress-changed', progress)
        // 派发手指松开后的监听事件
      },
      onClick(e) {
        // 点击可以变更进度条进度
        const rect = this.$el.getBoundingClientRect()
        // 获取Rect里的left值
        const offsetWidth = e.pageX - rect.left
        // 用点击的X值减去进度条左边的距离就是偏移量
        const barWidth = this.$el.clientWidth - progressBtnWidth
        const progress = offsetWidth / barWidth
        this.$emit('progress-changed', progress)
      },
      setOffset(progress) {
        const barWidth = this.$el.clientWidth - progressBtnWidth
        this.offset = barWidth * progress
      }
    }
  }
</script>

<style lang="scss" scoped>
  .progress-bar {
    height: 30px;
    .bar-inner {
      position: relative;
      top: 13px;
      height: 4px;
      background: rgba(0, 0, 0, 0.3);
      .progress {
        position: absolute;
        height: 100%;
        background: $color-theme;
      }
      .progress-btn-wrapper {
        position: absolute;
        left: -8px;
        top: -13px;
        width: 30px;
        height: 30px;
        .progress-btn {
          position: relative;
          top: 7px;
          left: 7px;
          box-sizing: border-box;
          width: 16px;
          height: 16px;
          border: 3px solid $color-text;
          border-radius: 50%;
          background: $color-theme;
        }
      }
    }
  }
</style>

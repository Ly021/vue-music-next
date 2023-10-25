<template>
  <div class="progress-circle">
    <svg
      :width="radius"
      :height="radius"
      viewBox="0 0 100 100"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        class="progress-background"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
      />
      <circle
        class="progress-bar"
        r="50"
        cx="50"
        cy="50"
        fill="transparent"
        :stroke-dasharray="dashArray"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <slot></slot>
  </div>
</template>

<script>
  export default {
    name: 'progress-circle',
    props: {
      radius: {
        type: Number,
        default: 100
      },
      progress: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        dashArray: Math.PI * 100
        // 2*PI*r(r=50)所以他的周长是Math.PI * 100
      }
    },
    computed: {
      dashOffset() {
        // 和progress的值为线性负相关，progress的值越大，dashOffset的值越小
        return (1 - this.progress) * this.dashArray
      }
    }
  }
</script>

<style lang="scss" scoped>
  .progress-circle {
    position: relative;
    circle {
      stroke-width: 8px;
      // stroke-width 是用于设置描边宽度的属性。
      transform-origin: center;
      &.progress-background {
        transform: scale(0.9);
        stroke: #f9c20f;
        // stroke 是一个CSS属性，通常用于定义矢量图形的描边颜色
      }
      &.progress-bar {
        transform: scale(0.9) rotate(-90deg);
        stroke: $color-theme;
      }
    }
  }
</style>

<template>
  <scroll class="index-list"
  :probe-type="3"
  @scroll="onScroll"
  ref="scrollRef"
  >
    <ul ref="groupRef">
      <li
        v-for="group in data"
        :key="group.title"
        class="group"
      >
        <h2 class="title">{{ group.title }}</h2>
        <ul>
         <li
           v-for="item in group.list"
           :key="item.id"
           class="item"
           @click="onItemClick(item)"
         >
          <img class="avatar" v-lazy="item.pic">
          <span class="name">{{ item.name }}</span>
         </li>
        </ul>
      </li>
    </ul>
    <div class="fixed" v-show="fixedTitle" :style="fixedStyle">
      <!-- v-show解决了下拉出现多一条标题框问题  -->
      <div class="fixed-title">{{ fixedTitle }}</div>
    </div>
    <div
    class="shortcut"
    @touchstart.stop.prevent="onShortcutTouchStart"
    @touchmove.stop.prevent="onShortcutTouchMove"
    @touchend.stop.prevent
    >
      <ul>
        <li
          v-for="(item, index) in shortcutList"
          :key="item"
          :data-index="index"
          class="item"
          :class="{'current':currentIndex===index}"
        >
          {{ item }}
        </li>
      </ul>
    </div>
  </scroll>
</template>

<script>
    import Scroll from '@/components/wrap-scroll'
  import useFixed from './use-fixed'
  import useShortcut from './use-shortcut'
  export default {
    name: 'index-list',
    props: {
      data: {
        type: Array,
        default() {
          return []
        }
      }
    },
    emits: ['select'],
    setup(props, { emit }) {
      const { groupRef, onScroll, fixedTitle, fixedStyle, currentIndex } = useFixed(props)
      const { shortcutList, scrollRef, onShortcutTouchStart, onShortcutTouchMove } = useShortcut(props, groupRef)
      function onItemClick (item) {
        emit('select', item)
      }
      return {
      onItemClick,
       // fixed
      groupRef,
      onScroll,
      fixedTitle,
      fixedStyle,
      currentIndex,
      // shortcut
      shortcutList,
      scrollRef,
      onShortcutTouchStart,
      onShortcutTouchMove
      }
    },
    components: { Scroll }
  }
</script>

<style lang="scss" scoped>
  .index-list {
    position: relative;
    width: 100%;
    height: 100%;
    background: $color-background;
    overflow: hidden;
    .group {
      padding-bottom: 30px;
      .title {
        background: $color-highlight-background;
        font-size: $font-size-small;
        padding-left: 20px;
        height: 30px;
        color: $color-text-1;
        line-height: 30px;
      }
      .item {
        display: flex;
        align-items: center;
        padding: 20px 0 0 30px;
        .avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
        }
        .name {
          margin-left: 20px;
          font-size: $font-size-medium;
          color: $color-text-II;
        }
      }
    }
    .fixed {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      .fixed-title {
        height: 30px;
        line-height: 30px;
        padding-left: 20px;
        font-size: $font-size-small;
        color: $color-text-l;
        background: $color-highlight-background;
      }
    }
    .shortcut {
      position: absolute;
      right: 4px;
      top: 50%;
      font-family: Helvetica;
      background: $color-background-d;
      text-align: center;
      transform: translateY(-50%);
      width: 20px;
      padding: 20px 0;
      border-radius: 20px;
      .item {
        padding: 3px;
        font-size: $font-size-small;
        line-height: 1;
        color: $color-text-1;
        &.current {
          color: $color-theme
        }
      }
    }
  }
</style>

<template>
  <teleport to="body">
    <!-- teleport可以指定某个组件渲染到某一部分的 -->
    <transition name="list-fade">
      <div
        class="playlist"
        v-show="visible && playlist.length"
        @click="hide"
      >
        <div class="list-wrapper" @click.stop>
          <!-- 在list-wrapper添加一个阻止冒泡,就不会冒泡到最外层,阻止hide事件发生,不会收起 -->
          <div class="list-header">
            <h1 class="title">
              <i class="icon"
                :class="modeIcon"
                @click="changeMode"></i>
              <span class="text">{{ modeText }}</span>
              <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
            </h1>
          </div>
          <scroll
            ref="scrollRef"
            class="list-content"
          >
            <transition-group
              ref="listRef"
              name="list"
              tag="ul"
            >
              <li
                class="item"
                v-for="song in sequenceList"
                :key="song.id"
                @click="selectItem(song)"
              >
                <i
                  class="current"
                  :class="getCurrentIcon(song)"
                ></i>
                <span class="text">{{ song.name }}</span>
                <span class="favorite" @click.stop="toggleFavorite(song)">
                  <i :class="getFavoriteIcon(song)"></i>
                </span>
                <span class="delete"
                @click.stop="removeSong(song)"
                :class="{'disable': removing}"
                >
                <!-- disable是一个要应用的 CSS 类名,如果removing为true,则将disable类添加到dom上,若为false,则否 -->
                  <!-- 如果removeSong这个点击事件不去加上一个阻止冒泡, 可能会使得去执行上层的selectItem导致这首删除的歌曲播放 -->
                  <i class="icon-delete"></i>
                </span>
              </li>
            </transition-group>
          </scroll>
          <div class="list-add">
            <div class="add" @click="showAddSong">
              <i class="icon-add"></i>
              <span class="text">添加歌曲到列表</span>
            </div>
          </div>
          <div class="list-footer" @click.stop="hide">
            <span>关闭</span>
          </div>
        </div>
        <confirm
            ref="confirmRef"
            @confirm="confirmClear"
            text="是否清空播放列表？"
            confirm-btn-text="清空"
        ></confirm>
        <add-song ref="addSongRef"></add-song>
      </div>
    </transition>
  </teleport>
</template>

<script>
  import Scroll from '@/components/base/scroll/scroll'
  import Confirm from '@/components/base/confirm/confirm'
  import AddSong from '@/components/add-song/add-song'
  import { ref, computed, nextTick, watch } from 'vue'
  import { useStore } from 'vuex'
  import useMode from './use-mode'
  import useFavorite from './use-favorite'
  export default {
    name: 'playlist',
    components: {
      Scroll,
      Confirm,
      AddSong
    },
    setup() {
      const visible = ref(false)
      const removing = ref(false)
      const scrollRef = ref(null)
      const listRef = ref(null)
      const confirmRef = ref(null)
      const addSongRef = ref(null)

      const store = useStore()
      const playlist = computed(() => store.state.playlist)
      const sequenceList = computed(() => store.state.sequenceList)
      const { modeIcon, changeMode, modeText } = useMode()
      const { getFavoriteIcon, toggleFavorite } = useFavorite()
      const currentSong = computed(() => store.getters.currentSong)

      watch(currentSong, async(newSong) => {
        if (!visible.value || !newSong.id) {
          return
        }
        await nextTick()
        scrollToCurrent()
      })

      async function show() {
        visible.value = true
        // dom值改变但未更新，dom变化是有一个nextTick的过程，要在nextTick之后才能获取dom
        await nextTick()
        // refreshScroll()相当于一个异步更新操作，所以需要用到await nextTick
        refreshScroll()
        scrollToCurrent()
      }

      function hide() {
        visible.value = false
      }

      function refreshScroll() {
        scrollRef.value.scroll.refresh()
      }

      function scrollToCurrent() {
        // playlist为show时能够对应到当前播放的歌曲位置
        const index = sequenceList.value.findIndex((song) => {
          return currentSong.value.id === song.id
          // 使用sequenceList的findIndex方法去获取歌曲的id
        })
        if (index === -1) {
          // 避免获取不到歌曲的index时报错
          return
        }
        const target = listRef.value.$el.children[index]
        scrollRef.value.scroll.scrollToElement(target, 300)
        // 使用scroll中的scrollToElement方法移动到目标位置,0.3毫秒
      }

      function getCurrentIcon(song) {
        if (song.id === currentSong.value.id) {
          return 'icon-play'
        }
      }

      function selectItem(song) {
        const index = playlist.value.findIndex((item) => {
          return song.id === item.id
        })
        store.commit('setCurrentIndex', index)
        store.commit('setPlayingState', false)
      }

      function removeSong(song) {
        if (removing.value) {
          return
        }
        removing.value = true
        store.dispatch('removeSong', song)
        if (!playlist.value.length) {
          // 如果删除到歌曲长度为0的时候，也需要去执行visible=false
          hide()
        }
        // dispatch, 是vuex的一种方法, 通过actions触发状态变化.
        setTimeout(() => {
          // 设置定时器,300毫秒后将removing.value置为false,这样才可以接着点击删除,不然删除太快.
          removing.value = false
        }, 300)
      }

      function showConfirm() {
        confirmRef.value.show()
      }

      function confirmClear() {
        store.dispatch('clearSongList')
        hide()
      }

      function showAddSong() {
        addSongRef.value.show()
      }

      return {
        visible,
        playlist,
        sequenceList,
        currentSong,
        getCurrentIcon,
        scrollRef,
        addSongRef,
        listRef,
        selectItem,
        removing,
        removeSong,
        confirmRef,
        showConfirm,
        showAddSong,
        confirmClear,
        // mode
        modeIcon,
        changeMode,
        modeText,
        // favorite
        toggleFavorite,
        getFavoriteIcon,
        hide,
        show
      }
    }
  }
</script>

<style lang="scss" scoped>
  .playlist {
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    z-index: 200;
    background-color: rgba(0, 0, 0, 0.3);
    &.list-fade-enter-active, &.list-fade-leave-active {
      transition: opacity .3s;
      .list-wrapper {
        transition: all .3s;
      }
    }
    &.list-fade-enter-from, &.list-fade-leave-to {
      opacity: 0;
      .list-wrapper {
        transform: translate3d(0, 100%, 0);
      }
    }
    .list-wrapper {
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 210;
      width: 100%;
      background-color: #e9e7d0;
      .list-header {
        position: relative;
        padding: 20px 30px 10px 20px;
        .title {
          display: flex;
          align-items: center;
        }
        .icon {
          margin-right: 10px;
            font-size: 24px;
          color: rgb(249, 193, 23);
        }
        .text {
          flex: 1;
          font-size: $font-size-medium;
          color: rgb(114, 114, 111);
        }
      }
      .list-content {
        max-height: 240px;
        overflow: hidden;
        .item {
          display: flex;
          align-items: center;
          height: 40px;
          padding: 0 30px 0 20px;
          overflow: hidden;
          .current {
            flex: 0 0 20px;
            width: 20px;
            font-size: $font-size-small;
            color: rgb(249, 193, 23);
          }
          .text {
            flex: 1;
            color: rgb(122, 121, 118);
            font-size: $font-size-medium;
            @include no-wrap()
          }
          .favorite {
            @include extend-click();
            margin-right: 15px;
            font-size: $font-size-small;
            color: rgb(249, 193, 23);
            .icon-favorite {
              color: $color-sub-theme;
            }
          }
          .delete {
            @include extend-click();
            font-size: $font-size-small;
            color: rgb(249, 193, 23);
            &.disable {
              color: rgba(239, 218, 153, 0.651);
            }
          }
        }
      }
      .list-add {
        text-align: center;
        border: 3px solid #f3d368;
        color: #f3d368;
        line-height: 40px;
        border-radius: 25px;
        margin: 10px 60px;
      }
      .list-footer {
        text-align: center;
        line-height: 50px;
        color: rgb(235, 194, 72);
        background-color:#eda;
        font-size: $font-size-medium-x;
      }
    }
  }
</style>

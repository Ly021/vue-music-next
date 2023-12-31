<template>
  <transition name="mini">
    <div
      class="mini-player"
      v-show="!fullScreen"
      @click="showNormalPlayer"
    >
      <div class="cd-wrapper">
        <div
          class="cd"
          ref="cdRef"
        >
          <img
            width="40"
            height="40"
            :src="currentSong.pic"
            ref="cdImageRef"
            :class="cdCls"
          >
        </div>
      </div>
      <div
      class="slider-wrapper"
      ref="sliderWrapperRef">
        <div class="slider-group">
          <div
            class="slider-page"
            v-for="song in playlist"
            :key="song.id"
          >
            <h2 class="name">{{ song.name }}</h2>
            <p class="desc">{{ song.singer }}</p>
          </div>
        </div>
      </div>
      <div class="control">
        <progress-circle
          :radius="32"
          :progress="progress"
        >
          <i
          class="icon-mini"
          :class="miniPlayIcon"
          @click.stop="togglePlay"
          ></i>
        </progress-circle>
      </div>
      <div class="control" @click.stop="showPlaylist">
        <i class="icon-playlist"></i>
      </div>
      <Playlist ref="playlistRef"></Playlist>
    </div>
  </transition>
</template>

<script>
  import { useStore } from 'vuex'
  import { computed, ref } from 'vue'
  import useMiniSlider from './use-mini-slider'
  import useCd from './use-cd'
  import progressCircle from './progress-circle'
  import Playlist from './playlist'
  export default {
    name: 'mini-player',
    props: {
      progress: {
        type: Number,
        default: 0
        // 从player中传过来progress的值
      },
      togglePlay: Function
    },
    components: {
      progressCircle,
      Playlist
    },
    setup() {
      // compositionAPi开发(setup)
      const playlistRef = ref(null)
      const store = useStore()
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      const { cdCls, cdRef, cdImageRef } = useCd()
      const playing = computed(() => store.state.playing)
      const playlist = computed(() => store.state.playlist)
      const { sliderWrapperRef } = useMiniSlider()

      // hook
      const miniPlayIcon = computed(() => {
        return playing.value ? 'icon-pause-mini' : 'icon-play-mini'
      })

      // methods
      function showNormalPlayer() {
        store.commit('setFullScreen', true)
      }

      function showPlaylist() {
        playlistRef.value.show()
      }

      return {
        fullScreen,
        currentSong,
        miniPlayIcon,
        playlist,
        showNormalPlayer,
        showPlaylist,
        playlistRef,
        // cd
        cdCls,
        cdRef,
        cdImageRef,
        // mini-slider
        sliderWrapperRef
      }
    }
  }
</script>
<style lang="scss" scoped>
  .mini-player {
    display: flex;
    align-items: center;
    width: 100%;
    height: 60px;
    background: #f0ddb3;
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 180;
    .cd-wrapper {
      flex: 0 0 40px;
      width: 40px;
      padding: 0 10px 0 20px;
      height: 40px;
      .cd {
        height: 100%;
        width: 100%;
        img {
          border-radius: 50%;
          &.playing {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
    }
    .control {
      flex: 0 0 30px;
      width: 30px;
      padding: 0 10px;
      .icon-playlist {
        position: relative;
        top: -2px;
        font-size: 28px;
        color: rgb(253, 201, 46);
      }
      .icon-mini {
        position: absolute;
        left: 0;
        top: 0;
        color: $color-theme-d;
        font-size: 32px;
      }
    }
    .slider-wrapper {
      display: flex;
      flex-direction: column;
      justify-content: center;
      flex: 1;
      line-height: 20px;
      overflow: hidden;
      .slider-group {
        position: relative;
        overflow: hidden;
        white-space: nowrap;
        .slider-page {
          display: inline-block;
          width: 100%;
          transform: translate3d(0, 0, 0);
          backface-visibility: hidden;
          .name {
            margin-bottom: 2px;
            font-size: $font-size-medium;
            @include no-wrap();
            color: #f77373;
          }
          .desc {
            @include no-wrap();
            font-size: $font-size-small;
            color: rgba(44, 42, 42, 0.3);
          }
        }
      }
    }

    &.mini-enter-active, &.mini-leave-active {
      transition: all 0.6s cubic-bezier(0.45, 0, 0.55, 1);
    }
    &.mini-enter-from, &.mini-leave-to {
      opacity: 0;
      transform: translate3d(0, 100%, 0)
    }
  }
</style>

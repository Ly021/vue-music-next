<template>
  <div class="player"
    v-show="playlist.length"
  >
    <transition name="normal"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
    @after-leave="afterLeave">
      <div class="normal-player" v-show="fullScreen">
      <div class="background">
        <img :src="currentSong.pic" />
      </div>
      <div class="top">
        <div class="back" @click="goBack">
          <i class="icon-back"></i>
        </div>
        <h1 class="title">{{ currentSong.name }}</h1>
        <h2 class="subtitle">{{ currentSong.singer }}</h2>
      </div>
      <div class="middle"
        @touchstart.prevent="onMiddleTouchStart"
        @touchmove.prevent="onMiddleTouchMove"
        @touchend.prevent="onMiddleTouchEnd"
      >
        <div class="middle-l"
          :style="middleLStyle">
          <div class="cd-wrapper" ref="cdWrapperRef">
            <div class="cd" ref="cdRef">
              <img
              :src="currentSong.pic"
              class="image" :class="cdCls"
              ref="cdImageRef"
              >
            </div>
          </div>
          <div class="playing-lyric-wrapper">
            <div class="playing-lyric">{{playingLyric}}</div>
          </div>
       </div>
       <scroll
            class="middle-r"
            ref="lyricScrollRef"
            :style="middleRStyle"
          >
            <div class="lyric-wrapper">
              <div v-if="currentLyric" ref="lyricListRef">
                <p
                  class="text"
                  :class="{'current': currentLineNum === index}"
                  v-for="(line, index) in currentLyric.lines"
                  :key="line.num"
                >
                  {{line.txt}}
                </p>
              </div>
            </div>
          </scroll>
      </div>
      <div class="bottom">
        <div class="dot-wrapper">
          <span class="dot" :class="{'active': currentShow === 'cd'}">
          </span>
          <span class="dot" :class="{'active': currentShow === 'lyric'}"></span>
        </div>
        <div class="progress-wrapper">
            <span class="time time-l">{{formatTime(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar
                ref="barRef"
                :progress="progress"
                @progress-changing="onProgressChanging"
                @progress-changed="onProgressChanged"
              ></progress-bar>
            </div>
            <span class="time time-r">{{formatTime(currentSong.duration)}}</span>
          </div>
        <div class="operators">
            <div class="icon i-left">
              <i @click="changeMode" :class="modeIcon"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i @click="prev" class="icon-prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlay" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i @click="next" class="icon-next"></i>
            </div>
            <div class="icon i-right">
              <i @click="toggleFavorite(currentSong)" :class="getFavoriteIcon(currentSong)"></i>
            </div>
          </div>
      </div>
    </div>
    </transition>
    <mini-player
      :progress="progress"
      :toggle-play="togglePlay"
    ></mini-player>
    <audio
      ref="audioRef"
      @pause="pause"
      @canplay="ready"
      @error="error"
      @timeupdate="updateTime"
      @ended="end"
    >
    <!-- canplay 事件是HTML5 <audio> 和 <video> 元素的一个事件，它表示媒体资源（音频或视频）已经可以开始播放，即浏览器已经缓冲了足够的数据， -->
  <!-- 不绑定pause事件也可以实现效果，但不能保持后端数据同步，为了严谨，需要绑定 -->
    </audio>
    <!-- audio标签为html5的标签，可以控制歌曲的播放 -->
  </div>
</template>

<script>
  import { useStore } from 'vuex'
  // useStore是专门用来获取store的工具
  import { computed, watch, ref, nextTick } from 'vue'
  import useMode from './use-mode'
  import useFavorite from './use-favorite'
  import ProgressBar from './progress-bar'
  import { formatTime } from '@/assets/js/util'
  import { PLAY_MODE } from '../../assets/js/constant'
  import useCd from './use-cd'
  import useLyric from './use-lyric'
  import Scroll from '../base/scroll/scroll.vue'
  import useMiddleInteractive from './use-middle-interactive'
  import usePlayHistory from './use-play-history'
  import MiniPlayer from './mini-player'
  import useAnimation from './use-animation'

  export default {
    name: 'player',
    components: {
      ProgressBar,
      Scroll,
      MiniPlayer
    },
    setup() {
      // data
      const audioRef = ref(null)
      const barRef = ref(null)
      const songReady = ref(false)
      const currentTime = ref(0)
      let progressChanging = false

      // vuex
      const store = useStore()
      const fullScreen = computed(() => store.state.fullScreen)
      const currentSong = computed(() => store.getters.currentSong)
      const playing = computed(() => store.state.playing)
      const currentIndex = computed(() => store.state.currentIndex)
      const playMode = computed(() => store.state.playMode)

      // hooks
      const { modeIcon, changeMode } = useMode()
      const { getFavoriteIcon, toggleFavorite } = useFavorite()
      const { cdCls, cdRef, cdImageRef } = useCd()
      const { playingLyric, currentLineNum, currentLyric, playLyric, lyricListRef, lyricScrollRef, stopLyric, pureMusicLyric } = useLyric({ songReady, currentTime })
      const { onMiddleTouchStart, onMiddleTouchMove, onMiddleTouchEnd, currentView, currentShow, middleLStyle, middleRStyle } = useMiddleInteractive()
      const { cdWrapperRef, enter, afterEnter, leave, afterLeave } = useAnimation()
      const { savePlay } = usePlayHistory()

      // computed
      const playIcon = computed(() => {
        return playing.value ? 'icon-pause' : 'icon-play'
      })
      const playlist = computed(() => store.state.playlist)
      const disableCls = computed(() => {
        return songReady.value ? '' : 'disable'
      })
      const progress = computed(() => {
        return currentTime.value / currentSong.value.duration
      })
      // watch
      watch(currentSong, (newSong) => {
        if (!newSong.id || !newSong.url) {
          return
        }
        currentTime.value = 0
        songReady.value = false
        const audioEl = audioRef.value
        audioEl.src = newSong.url
        audioEl.play()
        store.commit('setPlayingState', true)
      })

// Uncaught (in promise) DOMException: The play() request was interrupted by a new load request.报错4
// 步骤是先执行playing的play()方法，返回的是一个promise对象,然后再去更新新的src
// 报错原因是:快速点击会导致你在执行play()过程中他又需要去添加新的src,处理不过来
      watch(playing, (newPlaying) => {
        if (!songReady.value) {
          return
        }
        const audioEl = audioRef.value
        if (newPlaying) {
          audioEl.play()
          playLyric()
        } else {
          audioEl.pause()
          stopLyric()
        }
        newPlaying ? audioEl.play() : audioEl.pause()
      })

      watch(fullScreen, async (newFullScreen) => {
        if (newFullScreen) {
          await nextTick()
          // 在vue中访问一些dom时，或者要依赖数据变化，一定要在nextTick()后再访问，才能正确访问到预期的。
          barRef.value.setOffset(progress.value)
        }
      })

      // methods

      function goBack() {
        store.commit('setFullScreen', false)
      }

      function togglePlay() {
        if (!songReady.value) {
          return
        }
        store.commit('setPlayingState', !playing.value)
      }

      function pause() {
        store.commit('setPlayingState', false)
      }

      function prev() {
        let index = currentIndex.value - 1
        const list = playlist.value
        if (!songReady.value || !list.length) {
          return
        }
        if (list.length === 1) {
          loop()
        } else {
          if (index === -1) {
            index = list.length
          }
          store.commit('setCurrentIndex', index)
        }
      }

      function next() {
        const list = playlist.value
        if (!songReady.value || !list.length) {
          return
        }

        if (list.length === 1) {
          loop()
        } else {
          let index = currentIndex.value + 1
          if (index === list.length) {
            index = 0
          }
          store.commit('setCurrentIndex', index)
        }
      }

      function loop() {
        const audioEl = audioRef.value
        audioEl.currentTime = 0
        audioEl.play()
        store.commit('setPlayingState', true)
      }

      function ready() {
        if (songReady.value) {
          return
        }
        songReady.value = true
        // 为了保证在获取歌词时能够触发播放歌词
        playLyric()
        savePlay(currentSong.value)
      }

      function error() {
        songReady.value = true
      }

      function updateTime(e) {
        if (!progressChanging) {
          currentTime.value = e.target.currentTime
        }
      }

      function onProgressChanging(progress) {
        progressChanging = true
        currentTime.value = currentSong.value.duration * progress
        // 让歌词去同步位置
        playLyric()
        // 在确定位置过程中避免播放,等松开后再播放
        stopLyric()
      }

      function onProgressChanged(progress) {
        progressChanging = false
        audioRef.value.currentTime = currentTime.value = currentSong.value.duration * progress
        if (!playing.value) {
          store.commit('setPlayingState', true)
        }
        // 再进行一次playLyric就可以同步歌词了
        playLyric()
      }

      function end() {
        currentTime.value = 0
        if (playMode.value === PLAY_MODE.loop) {
          loop()
        } else {
          next()
        }
      }
      return {
        audioRef,
        fullScreen,
        currentSong,
        currentTime,
        disableCls,
        playIcon,
        progress,
        formatTime,
        playlist,
        barRef,
        goBack,
        end,
        onProgressChanged,
        onProgressChanging,
        updateTime,
        togglePlay,
        pause,
        prev,
        next,
        ready,
        error,
        // use-mode
        modeIcon,
        changeMode,
        // use-favorite
        getFavoriteIcon,
        toggleFavorite,
        // use-cd
        cdCls,
        cdRef,
        cdImageRef,
        // use-lyric
        currentLineNum,
        currentLyric,
        playLyric,
        lyricListRef,
        lyricScrollRef,
        pureMusicLyric,
        playingLyric,
        // use-middle-interactive
        onMiddleTouchStart,
        onMiddleTouchMove,
        onMiddleTouchEnd,
        currentView,
        currentShow,
        middleLStyle,
        middleRStyle,
        // use-animation
        enter,
        afterEnter,
        cdWrapperRef,
        leave,
        afterLeave,
        // use-play-history
        savePlay
      }
    }
  }
</script>

<style lang="scss" scoped>
  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);

        img {
          width: 100%;
          height: 100%;
        }
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
        }
        .icon-back {
          display: block;
          padding: 9px;
          font-size: $font-size-large-x;
          color: $color-theme;
          transform: rotate(-90deg);
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            box-sizing: border-box;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              border-radius: 50%;
              img {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                box-sizing: border-box;
                border-radius: 50%;
                border: 10px solid rgba(255, 255, 255, 0.1);
              }
              .playing {
                animation: rotate 20s linear infinite
              }
            }
          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }
        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }
            .pure-music {
              padding-top: 50%;
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
            }
          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }
        }
        .progress-wrapper {
          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 40px;
            line-height: 30px;
            width: 40px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px;
            }
          }
          .i-left {
            text-align: right;
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }
          .i-right {
            text-align: left
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all .6s;
        .top, .bottom {
          transition: all .6s cubic-bezier(0.45, 0, 0.55, 1);
        }
      }
      &.normal-enter-from, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
  }
</style>

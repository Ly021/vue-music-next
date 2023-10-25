<template>
  <div class="music-list">
    <div class="back" @click="goBack">
      <i class="icon-back"></i>
    </div>
    <h1 class="title">{{ title }}</h1>
    <div
      class="bg-image"
      :style="bgImageStyle"
      ref="bgImage"
    >
      <div
        class="play-btn-wrapper"
        :style="playBtnStyle"
      >
        <div
          v-show="songs.length"
          class="play-btn"
        >
          <i class="icon-play"></i>
          <span class="text"
            @click="random"
          >随机播放全部</span>
        </div>
      </div>
      <div class="filter"
        :style="filterStyle"
      >
      </div>
    </div>
    <scroll class="list"
      :style="scrollStyle"
      v-loading="loading"
      :probe-type="3"
      @scroll="onScroll"
      v-no-result:[noResultText]="noResult"
    >
      <div class="song-list-wrapper">
        <song-list
          :songs="songs"
          @select="selectItem"
          :rank="rank"
        >
      <!-- @select="selectItem"是监听selectItem，可以监听到song-list传过来的值 -->
        </song-list>
      </div>
    </scroll>
  </div>
</template>
<script>
  import SongList from '@/components/base/song-list/song-list'
  import Scroll from '@/components/wrap-scroll'
  import { mapActions, mapState } from 'vuex'

  const RESERVED_HEIGHT = 40
  // 设置顶层的高度

  export default {
    name: 'music-list',
    components: {
      SongList,
      Scroll
    },
    props: {
      songs: {
        type: Array,
        default() {
            return []
        }
      },
      title: String,
      pic: String,
      loading: Boolean,
      noResultText: {
      type: String,
      default: '抱歉，暂无可播放歌曲~'
    },
    rank: Boolean
    },
    data() {
      return {
        imageHeight: 0,
        scrollY: 0,
        maxTranslateY: 0
      }
    },
    computed: {
      noResult() {
        return !this.loading && !this.songs.length
      },
      bgImageStyle() {
        const scrollY = this.scrollY
        let zIndex = 0
        let paddingTop = '70%'
        let height = 0
        let translateZ = 0
        let scale = 1

        if (scrollY > this.maxTranslateY) {
          zIndex = 10
          paddingTop = 0
          height = `${RESERVED_HEIGHT}px`
          translateZ = 1
        }
        if (scrollY < 0) {
          scale = 1 + Math.abs(scrollY / this.imageHeight)
        }
        return {
          zIndex,
          // 样式渲染，将获取到的imageurl渲染为背景图片
          backgroundImage: `url(${this.pic})`,
          transform: `scale(${scale})translateZ(${translateZ})`,
          paddingTop,
          height
        }
      },
      scrollStyle() {
        const bottom = this.playlist.length ? '60px' : '0'
        return {
          top: `${this.imageHeight}px`,
          bottom
        }
      },
      filterStyle() {
        let blur = 0
        const scrollY = this.scrollY
        const imageHeight = this.imageHeight
        if (scrollY >= 0) {
          blur = Math.min(this.maxTranslateY / imageHeight, scrollY / imageHeight) * 20
        }
        return {
          backdropFilter: `blur(${blur}px)`
        }
      },
      ...mapState([
      // 使用 mapState 将 'playlist' 映射到组件的计算属性中
          'playlist'
        ]),
      playBtnStyle() {
        // 绑定到playbtn上，避免上拉后置顶栏还有该组件
        let display = ''
        if (this.scrollY >= this.maxTranslateY) {
          display = 'none'
        }
        return {
          display
        }
      }
    },
    mounted() {
      this.imageHeight = this.$refs.bgImage.clientHeight
      // 通过绑定ref获取image高度,通过clientHeight获取高度返回给imageHeight
      this.maxTranslateY = this.imageHeight - RESERVED_HEIGHT
    },
    methods: {
      random() {
        this.randomPlay(this.songs)
      },
      goBack() {
        this.$router.back()
        // 调用路由的回退方法
      },
      onScroll(pos) {
        this.scrollY = -pos.y
      },
      selectItem({ song, index }) {
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      ...mapActions([ // vuex提供的语法糖，先import，在通过...的形式引入
        'selectPlay',
        'randomPlay'
      ])
    }
  }
</script>

<style lang="scss" scoped>
  .music-list {
    position: relative;
    height: 100%;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 20;
      transform: translateZ(2px);
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .title {
        position: absolute;
        top: 0;
        text-align: center;
        width: 80%;
        z-index: 20;
        font-size: $font-size-large;
        left: 10%;
        line-height: 40px;
        color: #fff;
        transform: translateZ(2px);
      }
    .bg-image {
      position: relative;
      background-size: cover;
      width: 100%;
      transform-origin: top;
      .play-btn-wrapper {
        position: absolute;
        bottom: 20px;
        z-index: 10;
        width: 100%;
        .play-btn {
          box-sizing: border-box;
          text-align: center;
          color: $color-theme;
          border: 1px solid $color-theme;
          border-radius: 100px;
          margin: 0 auto;
          padding: 7px 0;
          font-size: 0;
          width: 135px;
        }
        .icon-play {
          display: inline-block;
          vertical-align: middle;
          font-size: 16px;
          margin-right: 6px;
        }
        .text {
          display: inline-block;
          vertical-align: middle;
          font-size: 12px;
        }
      }
      .filter {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(7, 17, 27, 0.4);
      }
    }
    .list {
      position: absolute;
      bottom: 0;
      width: 100%;
      z-index: 0;
      .song-list-wrapper {
        padding: 20px 30px;
        background: $color-background;
      }
    }
  }
</style>

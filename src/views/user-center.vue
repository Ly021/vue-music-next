<template>
  <div class="user-center" v-no-result:[noResultText]="noResult">
    <div class="back">
      <i class="icon-back" @click="back"></i>
    </div>
    <div class="switches-wrapper">
      <switches
        :items="['我喜欢的', '最近播放']"
        v-model="currentIndex"
      ></switches>
    </div>
    <div class="play-btn"
    v-if="currentList.length"
    @click="random"
    >
      <i class="icon-play"></i>
      <span class="text">随机播放全部</span>
    </div>
    <div class="list-wrapper">
      <scroll class="list-scroll" v-if="currentIndex===0">
        <div class="list-inner">
          <song-list
            :songs="favoriteList"
            @select="selectSong"
          ></song-list>
        </div>
      </scroll>
      <scroll class="list-scroll" v-if="currentIndex===1">
        <div class="list-inner">
          <song-list :songs="playHistory"  @select="selectSong"></song-list>
        </div>
      </scroll>
    </div>
  </div>
</template>

<script>
  import Scroll from '@/components/wrap-scroll'
  import SongList from '@/components/base/song-list/song-list'
  import Switches from '@/components/base/switches/switches'
  import { mapState, mapActions } from 'vuex'

  export default {
    name: 'user-center',
    components: {
      Scroll,
      SongList,
      Switches
    },
    data() {
      return {
        currentIndex: 0
      }
    },
    computed: {
      noResult() {
        return this.currentIndex === 0 ? !this.favoriteList.length : !this.playHistory.length
      },
      noResultText() {
        return this.currentIndex === 0 ? '暂无收藏歌曲' : '你还没听过歌曲'
      },
      currentList() {
        return this.currentIndex === 0 ? this.favoriteList : this.playHistory
      },
      ...mapState([
        'favoriteList',
        'playHistory'
      ])
// 直接将它映射为一个计算属性，而不需要指定具体的状态属性名称。这将把整个 state 对象映射到组件的计算属性中。
    },
    methods: {
      back() {
        this.$router.back()
      },
      selectSong({ song }) {
        this.addSong(song)
      },
      ...mapActions([
        'addSong',
        'randomPlay'
      ]),
      random() {
        this.randomPlay(this.currentList)
      }
    }
  }
</script>

<style lang="scss" scoped>
  // .user-center {
  //   position: fixed;
  //   top: 0;
  //   bottom: 0;
  //   z-index: 100;
  //   width: 100%;
  //   background-color: #eda;
  //   .back {
  //     position: absolute;
  //     top: 0;
  //     left: 6px;
  //     .icon-back {
  //       display: block;
  //       padding: 10px;
  //       font-size: $font-size-large-x;
  //       color: rgb(238, 162, 55);
  //     }
  //   }
  //   .switches-wrapper {
  //     top: 0;
  //     padding: 10px;
  //   }
  //   .play-btn {
  //     border-radius: 20px;
  //     border: solid 2px rgb(238, 162, 55);
  //     padding: 5px;
  //     margin: 0 120px;
  //     text-align: center;
  //     color: rgb(238, 162, 55);
  //     .icon-play {
  //       display: inline-block;
  //       vertical-align: middle;
  //       margin-right: 6px;
  //       font-size: $font-size-medium-x;
  //     }
  //     .text {
  //       display: inline-block;
  //       vertical-align: middle;
  //       font-size: $font-size-small;
  //     }
  //   }
  //   .list-wrapper {
  //     position: absolute;
  //     top: 110px;
  //     bottom: 0;
  //     width: 100%;
  //     .list-scroll {
  //       height: 100%;
  //       overflow: hidden;
  //     }
  //   }
  // }
  .user-center {
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 100;
    width: 100%;
    background: $color-background;
    .back {
      position: absolute;
      top: 0;
      left: 6px;
      z-index: 50;
      .icon-back {
        display: block;
        padding: 10px;
        font-size: $font-size-large-x;
        color: $color-theme;
      }
    }
    .switches-wrapper {
      margin: 10px 0 30px 0;
    }
    .play-btn {
      box-sizing: border-box;
      width: 135px;
      padding: 7px 0;
      margin: 0 auto;
      text-align: center;
      border: 1px solid $color-theme;;
      color: $color-theme;
      border-radius: 100px;
      font-size: 0;
      .icon-play {
        display: inline-block;
        vertical-align: middle;
        margin-right: 6px;
        font-size: $font-size-medium-x;
      }
      .text {
        display: inline-block;
        vertical-align: middle;
        font-size: $font-size-small;
      }
    }
    .list-wrapper {
      position: absolute;
      top: 110px;
      bottom: 0;
      width: 100%;
      .list-scroll {
        height: 100%;
        overflow: hidden;
        .list-inner {
          padding: 20px 30px;
        }
      }
    }
  }
</style>

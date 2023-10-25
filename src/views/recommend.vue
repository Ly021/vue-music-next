<template>
    <div class="recommend" v-loading:[loadingText]="loading">
      <scroll class="recommend-content">
      <div>
        <div class="slider-wrapper">
          <div class="slider-content">
            <slider v-if="sliders.length" :sliders="sliders"></slider>
          </div>
        </div>
        <div class="recommend-list">
          <!-- 使用v-show这个内置指令去让热门歌单推荐在加载时候不显示 -->
          <h1 class="list-title"  v-show="!loading">热门歌单</h1>
          <ul>
            <li
              v-for="item in albums"
              class="item"
              :key="item.id"
              @click="selectItem(item)"
            >
              <div class="icon">
                <div class="src"><img v-lazy="item.pic" width="60" height="60"></div>
              </div>
              <div class="text">
                <h2 class="name">{{ item.username }}</h2>
                <p class="title">{{ item.title }}</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <router-view v-slot="{ Component }">
          <!-- name需要跟base.scss中的过渡动画的第一个名相同才能起效，例如：.slide-enter-active中的slide -->
          <transition appear name="slide">
            <!-- components需要记得绑定内容 -->
            <component :is="Component" :data="selectedAlbum" />
          </transition>
        </router-view>
      </scroll>
    </div>
</template>

<script>
  import { getRecommend } from '@/service/recommend'
  import Slider from '@/components/base/slider/slider'
  import Scroll from '@/components/wrap-scroll'
  import storage from 'good-storage'
  import { ALBUM_KEY } from '../assets/js/constant'
  export default {
    name: 'recommend',
    async created() {
      const result = await getRecommend()
      console.log(result)
      this.sliders = result.sliders
      this.albums = result.albums
    },
    computed: {
      loading() {
        return !this.sliders.length && !this.albums.length
      }
    },
    methods: {
      selectItem(album) {
        this.selectedAlbum = album
        this.cacheAlbum(album)
        this.$router.push({
          path: `./recommend/${album.id}`
        })
      },
      cacheAlbum(album) {
        storage.session.set(ALBUM_KEY, album)
        // 解决刷新详情页不会退出问题
      }
    },
    data() {
      return {
        sliders: [],
        albums: [],
        selectedAlbum: null,
        loadingText: '正在载入...'
      }
    },
    components: {
      Slider,
      Scroll
    }
  }
</script>

<style lang="scss" scoped>
  .recommend {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    overflow: scroll;
    .recommend-content {
      height: 100%;
      overflow: hidden;
      .slider-wrapper {
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 40%;
        overflow: hidden;
        .slider-content {
          position: absolute;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }
      }
      .recommend-list {
        .list-title {
          height: 65px;
          font-size: 24px;
          color: #514d4f;
          line-height: 65px;
          text-align: left;
          padding-left: 20px
        }
        .item {
          display: flex;
          box-sizing: border-box;
          align-items: center;
          padding: 0 20px 20px 20px;
          .icon {
            flex: 0 0 60px;
            width: 60px;
            padding-right: 20px;
            .src {
              box-shadow: 2px 2px 2px 2px #514d4f;
            }
          }
          .text {
            display: flex;
            flex-direction: column;
            justify-content: center;
            flex: 1;
            line-height: 20px;
            overflow: hidden;
            font-size: $font-size-medium;
          }
          .name {
            margin-bottom: 10px;
            color: $color-text;
          }
          .name:hover {
            margin-bottom: 10px;
            color: #dbc622;
          }
          .title {
            color: $color-text-d;
          }
        }
      }
    }
  }
</style>

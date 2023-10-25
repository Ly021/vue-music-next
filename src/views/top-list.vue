<template>
    <div class="top-list" v-loading="loading">
      <scroll class="top-list-content">
        <ul>
          <li
            class="item"
            v-for="item in topList"
            :key="item.id"
            @click="selectItem(item)"
          >
            <div class="icon">
              <img
                width="100"
                height="100"
                v-lazy="item.pic"
              >
            </div>
            <ul class="song-list">
              <li
                class="song"
                v-for="(song, index) in item.songList"
                :key="song.id"
                >
                <span>{{ index + 1 }}.</span>
                <span>{{ song.songName }} - {{ song.singerName }}</span>
              </li>
            </ul>
          </li>
        </ul>
      </scroll>
      <router-view v-slot="{ Component }">
          <!-- name需要跟base.scss中的过渡动画的第一个名相同才能起效，例如：.slide-enter-active中的slide -->
          <transition appear name="slide">
            <!-- components需要记得绑定内容 -->
            <component :is="Component" :data="selectedTop" />
          </transition>
        </router-view>
    </div>
</template>

<script>
  import Scroll from '@/components/wrap-scroll'
  import { getTopList } from '../service/top-list'
  import storage from 'good-storage'
  import { TOP_KEY } from '../assets/js/constant'
  export default {
    name: 'top-list',
    components: {
      Scroll
    },
    data() {
      return {
        topList: [],
        loading: true,
        selectedTop: null
      }
    },
    async created() {
      const result = await getTopList()
      this.topList = result.topList
      this.loading = false
    },
    methods: {
      selectItem(top) {
        this.selectedTop = top
        this.$router.push({
          path: `/top-list/${top.id}`
        })
      },
      cacheStorage(top) {
        storage.session.set(TOP_KEY, top)
      }
    }
  }
</script>

<style lang="scss" scoped>
  .top-list {
    width: 100%;
    top: 88px;
    bottom: 0;
    position: fixed;
    .top-list-content {
      overflow: hidden;
      height: 100%;
      .item {
        display: flex;
        margin: 0 20px;
        overflow: hidden;
        padding-top: 20px;
        height: 100px;
        &:last-child {
          padding-bottom: 20px;
        }
        .icon {
          flex: 0 0 100px;
          width: 100px;
          height: 100px;
        }
        .song-list {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          overflow: hidden;
          font-size: 12px;
          padding: 0 20px;
          background-color: #eda;
          color: rgb(124, 123, 121);
          width: 100%;
          height: 100px;
          .song {
            @include no-wrap();
            line-height: 26px;
          }
        }
      }
    }
  }
</style>

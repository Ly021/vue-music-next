<template>
    <div class="singer" v-loading="!singers.length">
        <index-list
          :data="singers"
          @select="selectSinger"
        ></index-list>
        <router-view v-slot="{ Component }">
          <!-- name需要跟base.scss中的过渡动画的第一个名相同才能起效，例如：.slide-enter-active中的slide -->
          <transition appear name="slide">
            <!-- components需要记得绑定内容 -->
            <component :is="Component" :data="selectedSinger" />
          </transition>
        </router-view>
    </div>
</template>
<!-- @select事件获取前面从index-list中传出的emit的事件中的select -->
<script>
  import { getSingerList } from '@/service/singer'
  import IndexList from '@/components/index-list/index-list'
  import storage from 'good-storage'
  import { SINGER_KEY } from '../assets/js/constant'
  export default {
    name: 'singer',
    data() {
      return {
        singers: [],
        selectedSinger: null
      }
    },
    async created () {
      const result = await getSingerList()
      this.singers = result.singers
      console.log(result)
    },
    components: {
      IndexList
    },
    methods: {
      selectSinger(singer) {
        this.selectedSinger = singer
        // 将singer赋值
        this.cacheStorage(singer)
        this.$router.push({
          // 导航到 /singer/${singer.mid} 路由。这将触发路由导航到歌手页面，并且传递了歌手的 mid 作为路径参数。
          path: `/singer/${singer.mid}`
        })
      },
      cacheStorage(singer) {
        storage.session.set(SINGER_KEY, singer)
        // 歌手信息存储到会话存储 SINGER_KEY 变量用于标识歌手数据。
      }
    }
  }
</script>

<style lang="scss" scoped>
  .singer {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }
</style>

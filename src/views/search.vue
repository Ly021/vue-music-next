<template>
    <div class="search">
       <div class="search-input-wrapper">
        <search-input v-model="query"></search-input>
       </div>
       <scroll
       ref="scrollRef"
       class="search-content"
       v-show="!query">
       <div>
        <div class="hot-keys">
          <h1 class="title">
            热门搜索
          </h1>
          <ul>
            <li
              class="item"
              v-for="item in hotKeys"
              :key="item.id"
              @click="addQuery(item.key)"
            >
              <span>{{ item.key }}</span>
            </li>
          </ul>
        </div>
        <div class="search-history" v-show="searchHistory.length">
          <h1 class="title">
            <span class="text">搜索历史</span>
            <span class="clear" @click="showConfirm">
              <i class="icon-clear"></i>
            </span>
          </h1>
          <confirm
            ref="confirmRef"
            text="是否清空所有搜索历史"
            confirm-btn-text="清空"
            @confirm="clearSearch"
          >

          </confirm>
          <search-list
          :searches="searchHistory"
          @select="addQuery"
          @delete="deleteSearch"
          >
          </search-list>
        </div>
      </div>
       </scroll>
      <div class="search-result" v-show="query">
        <suggest
        :query="query"
        @select-song="selectSong"
        @select-singer="selectSinger"
        ></suggest>
      </div>
      <router-view v-slot="{ Component }">
        <!-- appear 属性表示在组件首次渲染时也应用过渡效果，而不仅仅在后续的切换过程中。 -->
        <transition appear name="slide">
          <!-- v-slot="{ Component }，它用于获取<router-view>中渲染的组件，将其命名为 Component 变量。这允许你访问当前路由视图中的组件，以便在后续代码中使用。 -->
          <component :is="Component" :data="selectedSinger"></component>
        </transition>
      </router-view>
    </div>
</template>

<script>
  import SearchInput from '@/components/search/search-input'
  import Suggest from '@/components/search/suggest'
  import SearchList from '@/components/base/search-list/search-list'
  import Confirm from '@/components/base/confirm/confirm'
  import { ref, computed, watch, nextTick } from 'vue'
  import { getHotKeys } from '@/service/search'
  import { useStore } from 'vuex'
  import { useRouter } from 'vue-router'
  import storage from 'good-storage'
  import { SINGER_KEY } from '../assets/js/constant'
  import useSearchHistory from '@/components/search/use-search-history'
  import Scroll from '@/components/wrap-scroll'

  export default {
    name: 'search',
    components: {
      SearchInput,
      Suggest,
      SearchList,
      Scroll,
      Confirm
    },
    setup() {
      const query = ref('')
      const hotKeys = ref([])
      const selectedSinger = ref(null)
      const scrollRef = ref(null)
      const confirmRef = ref(null)

      const store = useStore()
      const searchHistory = computed(() => store.state.searchHistory)
      const router = useRouter()

      const { saveSearch, deleteSearch, clearSearch } = useSearchHistory()

      getHotKeys().then((result) => {
        hotKeys.value = result.hotKeys
      })

      // watch(query, async (newQuery) => {
      //   if (!newQuery) {
      //     await nextTick()
      //     refreshScroll()
      //   }
      // })

        watch(query, async(newQuery) => {
          if (!newQuery) {
            await nextTick()
            refreshScroll()
          }
        })

      function refreshScroll() {
        scrollRef.value.scroll.refresh()
      }

      function addQuery(s) {
        query.value = s
      }

      function selectSong(song) {
        saveSearch(query.value)
        store.dispatch('addSong', song)
      }

      function selectSinger(singer) {
        saveSearch(query.value)
        selectedSinger.value = singer
        // 执行路由跳转
        cacheSinger(singer)
        // 缓存时记得传入singer参数，否则刷新会退出
        router.push({
          path: `/search/${singer.mid}`
        })
      }

      function cacheSinger(singer) {
        // 缓存使得刷新页面不退出
        storage.session.set(SINGER_KEY, singer)
      }

      function showConfirm() {
        confirmRef.value.show()
      }

      return {
        query,
        hotKeys,
        addQuery,
        selectSong,
        selectSinger,
        selectedSinger,
        scrollRef,
        confirmRef,
        // searchHistory
        searchHistory,
        showConfirm,
        deleteSearch,
        clearSearch
      }
    }
  }
</script>

<style lang="scss" scoped>
  .search {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
    display: flex;
    flex-direction: column;
    .search-input-wrapper {
      margin: 20px;
    }
    .search-content {
      flex: 1;
      overflow: hidden;
      .hot-keys {
        margin: 0 20px 20px 20px;
        .title {
          margin-bottom: 20px;
          font-size: $font-size-medium;
          color: $color-text-l;
        }
        .item {
          display: inline-block;
          padding: 5px 10px;
          margin: 0 20px 10px 0;
          border-radius: 6px;
          background: $color-highlight-background;
          font-size: $font-size-medium;
          color: $color-text-d;
        }
      }
      .search-history {
        position: relative;
        margin: 0 20px;
        .title {
          display: flex;
          align-items: center;
          height: 40px;
          font-size: $font-size-medium;
          color: $color-text-l;
          .text {
            flex: 1;
          }
          .clear {
            @include extend-click();
            .icon-clear {
              font-size: $font-size-medium;
              color: $color-text-d;
            }
          }
        }
      }
    }
    .search-result {
      flex: 1;
      overflow: hidden;
    }
  }
</style>

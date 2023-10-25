<template>
  <div
  ref="rootRef"
  class="suggest"
  v-loading:[loadingText]="loading"
  v-no-result:[noResultText]="noResult"
  >
  <ul class="suggest-list">
      <li class="suggest-item"
      v-if="singer"
      @click="selectSinger(singer)"
      >
        <div class="icon">
          <i class="icon-mine"></i>
        </div>
        <div class="name">
          <p class="text">{{ singer.name }}</p>
        </div>
      </li>
      <li class="suggest-item"
        v-for="song in songs"
        :key="song.id"
        @click="selectSong(song)"
      >
        <div class="icon">
          <i class="icon-music"></i>
        </div>
        <div class="name">
          <p class="text">
            {{ song.singer }}-{{ song.name }}
          </p>
        </div>
      </li>
      <div class="suggest-item" v-loading:[loadingText]="pullUpLoading">
      </div>
    </ul>
  </div>
</template>

<script>
  import { ref, watch, computed, nextTick } from 'vue'
  import { search } from '@/service/search'
  import { processSongs } from '@/service/song'
  import usePullUpLoad from './use-pull-up-load'

  export default {
    name: 'suggest',
    props: {
      query: String,
      showSinger: {
        type: Boolean,
        default: true
      }
    },
    emits: ['select-song', 'select-singer'],
    setup(props, { emit }) {
      const singer = ref(null)
      const songs = ref([])
      const hasMore = ref(true)
      const page = ref(1)
      const loadingText = ref('')
      const noResultText = ref('抱歉，暂无搜索结果')
      const manualLoading = ref(false)

      const loading = computed(() => {
        return !singer.value && !songs.value.length
      })

      const noResult = computed(() => {
        return !singer.value && !songs.value.length && !hasMore.value
      })

      const pullUpLoading = computed(() => {
        return isPullUpLoad.value && hasMore.value
      })

      const preventPullUpLoad = computed(() => {
        return loading.value || manualLoading.value
      })

      const { isPullUpLoad, rootRef, scroll } = usePullUpLoad(searchMore, preventPullUpLoad)

      watch(() => props.query, async (newQuery) => {
        if (!newQuery) {
          return
        }
        await searchFirst()
      })

      async function searchFirst() {
        if (!props.query) {
          return
        }
        // 重置
        page.value = 1
        songs.value = []
        singer.value = null
        hasMore.value = true

        const result = await search(props.query, page.value, props.showSinger)
        songs.value = await processSongs(result.songs)
        singer.value = result.singer
        hasMore.value = result.hasMore
        await nextTick()
        await makeItScrollable()
      }

      async function searchMore() {
        if (!hasMore.value || !props.query) {
          return
        }
        page.value++
        // page.value++表示进行下一页搜索
        const result = await search(props.query, page.value, props.showSinger)
        songs.value = songs.value.concat(await processSongs(result.songs))
        // concat将新获取的歌曲跟旧的歌曲拼接到一起
        hasMore.value = result.hasMore
        // 更新hasMore值，表示是否还能获取更多的值
        await nextTick()
        await makeItScrollable()
      }

      async function makeItScrollable() {
        if (scroll.value.maxScrollY >= -1) {
          manualLoading.value = true
          // 避免了无法填满整个搜索框 使用时要主要是否有拿到scroll传过来的值，否则会获取失败
          await searchMore()
          manualLoading.value = false
        }
      }

      function selectSong(song) {
        // 派发自定义事件
        emit('select-song', song)
      }

      function selectSinger(singer) {
        emit('select-singer', singer)
      }

      return {
        singer,
        songs,
        loadingText,
        noResult,
        loading,
        noResultText,
        // pullUpLoad
        pullUpLoading,
        rootRef,
        selectSong,
        selectSinger
      }
    }
  }
</script>

<style lang="scss" scoped>
  .suggest {
    height: 100%;
    overflow: hidden;
    .suggest-list {
      padding: 0 30px;
      .suggest-item {
        display: flex;
        align-items: center;
        padding-bottom: 20px;
        .icon {
          flex: 0 0 30px;
          width: 30px;
          [class^="icon-"] {
            font-size: 14px;
            color: $color-text-d;
          }
        }
        .name {
          flex: 1;
          font-size: $font-size-medium;
          color: $color-text-d;
          overflow: hidden;
          .text {
            @include no-wrap();
          }
        }
      }
    }
  }
</style>

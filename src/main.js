import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import lazyPlugin from 'vue3-lazy'
import loadingDirective from '@/components/base/loading/directive'
import noResultDirective from './components/base/no-result/directive'
import { load, saveAll } from '@/assets/js/array-store'
import { FAVORITE_KEY, PLAY_KEY } from '@/assets/js/constant'
import { processSongs } from '@/service/song'
// 引入全局样式文件
import '@/assets/scss/index.scss'

const favoriteSongs = load(FAVORITE_KEY)
if (favoriteSongs.length > 0) {
  // 初始化，避免和收藏中的歌曲url过期
  // 收藏歌曲url更新逻辑
  processSongs(favoriteSongs).then((songs) => {
    store.commit('setFavoriteList', songs)
    // 存储到store
    saveAll(songs, FAVORITE_KEY)
    // 存储到本地
  })
}

const historySongs = load(PLAY_KEY)
if (historySongs.length > 0) {
  // 最近播放列表更新
  processSongs(historySongs).then((songs) => {
    store.commit('setPlayHistory', songs)
    // 存储到store
    saveAll(songs, PLAY_KEY)
    // 存储到本地
  })
}

createApp(App).use(store).use(router).use(lazyPlugin, {
  loading: require('@/assets/images/default.png')
}).directive('loading', loadingDirective).directive('noResult', noResultDirective).mount('#app')

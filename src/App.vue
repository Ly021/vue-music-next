<template>
  <m-header></m-header>
  <tab></tab>
  <router-view :style="viewStyle" v-slot="{ Component }">
    <keep-alive>
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <router-view
    :style="viewStyle"
    v-slot="{ Component }"
    name="user"
  >
    <!-- name需要跟base.scss中的过渡动画的第一个名相同才能起效，例如：.slide-enter-active中的slide -->
    <transition appear name="slide">
      <keep-alive>
        <component :is="Component"/>
      </keep-alive>
    </transition>
  </router-view>
  <player></player>
</template>

<script>
import Header from '@/components/header/header'
import Tab from '@/components/tab/tab'
import Player from './components/player/player'
import { mapState } from 'vuex'
export default {
  components: {
    MHeader: Header,
    Tab,
    Player
  },
  computed: {
    viewStyle() {
      const bottom = this.playlist.length ? '60px' : '0'
      return {
        bottom
      }
    },
    ...mapState([
      'playlist'
    ])
  }
}
</script>

<style lang="scss">

</style>

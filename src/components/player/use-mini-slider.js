// 封装mini播放器滑动跳转歌曲的功能逻辑
import { ref, onMounted, nextTick, computed, watch, onUnmounted } from 'vue'
import { useStore } from 'vuex'
import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

BScroll.use(Slide)

export default function useMiniSlider() {
  const sliderWrapperRef = ref(null)
  const slider = ref(null)
  const store = useStore()
  const fullScreen = computed(() => store.state.fullScreen)
  const playlist = computed(() => store.state.playlist)
  const currentIndex = computed(() => store.state.currentIndex)
  const sliderShow = computed(() => {
    return !fullScreen.value && !!playlist.value
    // 该逻辑表示，只有fullScreen和playlist的值为true时候，sliderShow才为true
  })

  onMounted(() => {
    let sliderVal
    watch(sliderShow, async (newSliderShow) => {
       if (newSliderShow) {
        await nextTick()
        if (!sliderVal) { // BScroll初始化
          sliderVal = slider.value = new BScroll(sliderWrapperRef.value, {
            click: true,
            scrollX: true,
            scrollY: false,
            momentum: false,
            bounce: false,
            probeType: 2,
            slide: {
              autoplay: false,
              loop: true
            }
          })
          // 监听滑动,当滑动过后，将currentIndex赋值滑动page，就可以切换到相对应歌曲
          sliderVal.on('slidePageChanged', ({ pageX }) => {
            store.commit('setCurrentIndex', pageX)
          })
        } else {
          sliderVal.refresh()
        }
        sliderVal.goToPage(currentIndex.value, 0, 0)
        // 横向滚动所以y值为0，滚动时长也为0
      }
      watch(currentIndex, (newIndex) => {
        if (sliderVal && sliderShow.value) {
          // 监听sliderShow的值，如果不改变的话，那么goToPage改变dom实例是没意义的
          sliderVal.goToPage(newIndex, 0, 0)
        }
      })

      watch(playlist, async(newList) => {
        if (sliderVal && sliderShow.value && newList.length) {
          await nextTick()
            sliderVal.refresh()
        }
      })
    })
  })

  onUnmounted(() => {
    if (slider.value) {
      // 得slider中有去进行初始化获得数据时，再去执行销毁，对slider进行保护
      slider.value.destroy()
    }
  })

  return {
    slider,
    sliderWrapperRef
  }
}

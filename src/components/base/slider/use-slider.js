import BScroll from '@better-scroll/core'
import Slide from '@better-scroll/slide'

import { onMounted, onUnmounted, ref, onActivated, onDeactivated } from 'vue'

BScroll.use(Slide)

export default function useSlider(wrapperRef) {
  const slider = ref(null)
  const currentPageIndex = ref(0)
  onMounted(() => {
    const sliderVal = slider.value = new BScroll(wrapperRef.value, {
        click: true,
        scrollX: true,
        scrollY: false,
        momentum: false,
        bounce: false,
        probeType: 2,
        slide: true
    })
    sliderVal.on('slideWillChange', (page) => {
      currentPageIndex.value = page.pageX
    })
  })
  onUnmounted(() => {
    slider.value.destroy()
  })

  onActivated(() => {
    // 处理组件被激活（activated）时的操作
    slider.value.enable()
    // 调用slider对象中的enable方法，用于启用滚动功能。
    slider.value.refresh()
    // 调用slider对象中的refresh方法，用于刷新或重新加载滚动相关的内容。
  })

  onDeactivated(() => {
    slider.value.disable()
    // 是调用slider对象中的disable方法，用于禁用滚动功能。
  })

  return {
    slider,
    currentPageIndex
  }
}

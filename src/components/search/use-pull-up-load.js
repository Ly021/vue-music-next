import BScroll from '@better-scroll/core'
import PullUp from '@better-scroll/pull-up'
import ObserveDOM from '@better-scroll/slide'
import { ref, onMounted, onUnmounted, onActivated, onDeactivated } from 'vue'

BScroll.use(PullUp)
BScroll.use(ObserveDOM)

export default function usePullUpLoad(requestData, preventPullUpLoad) {
  const scroll = ref(null)
  const rootRef = ref(null)
  const isPullUpLoad = ref(false)
  // 控制是否正在拉取状态

  onMounted(() => {
    const scrollVal = scroll.value = new BScroll(rootRef.value, {
      // pullUpLoad实现上拉加载，observeDOM观测DOM变化
      pullUpLoad: true,
      observeDOM: true,
      click: true
    })
    // 实例化之后监听pullingUp事件
    scrollVal.on('pullingUp', pullingUpHandler)

    async function pullingUpHandler() {
      if (preventPullUpLoad.value) {
        scrollVal.finishPullUp()
        return
      }
      isPullUpLoad.value = true
      await requestData()
      scrollVal.finishPullUp()
      scrollVal.refresh()
      isPullUpLoad.value = false
    }
  })
  onUnmounted(() => {
    scroll.value.destroy()
  })

  onActivated(() => {
    // 处理组件被激活（activated）时的操作
    scroll.value.enable()
    // 调用scroll对象中的enable方法，用于启用滚动功能。
    scroll.value.refresh()
    // 调用scroll对象中的refresh方法，用于刷新或重新加载滚动相关的内容。
  })

  onDeactivated(() => {
    scroll.value.disable()
    // 是调用scroll对象中的disable方法，用于禁用滚动功能。
  })

  return {
    scroll,
    rootRef,
    isPullUpLoad
  }
}

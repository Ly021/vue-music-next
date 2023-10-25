import BScroll from '@better-scroll/core'
import ObserveDOM from '@better-scroll/observe-dom'
import { onMounted, onUnmounted, onActivated, onDeactivated, ref } from 'vue'

BScroll.use(ObserveDOM)
// ObserveDOM插件的作用在于能够在获取数据之后再次进行refresh，因为BScroll的原理是需要内容的高度大于页面的高度才能进行滑动，在一开始打开页面时，页面不能获取到加载完数据的高度，所以这也是在没添加ObserveDOM插件之前，无法滚动页面的原因
export default function useScroll(wrapperRef, options, emit) {
  const scroll = ref(null)
  onMounted(() => {
    const scrollVal = scroll.value = new BScroll(wrapperRef.value, {
      observeDOM: true,
      ...options
    })
    if (options.probeType > 0) {
      scrollVal.on('scroll', (pos) => {
        emit('scroll', pos)
      })
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

  return scroll
}

// 高阶Scroll组件的实现
import Scroll from '@/components/base/scroll/scroll'
import { h, nextTick, mergeProps, withCtx, renderSlot, ref, watch, computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'wrap-scroll',
  // 因为是在scroll组件上去优化，所以接收的props也是scroll的props
  props: Scroll.props,
  // 派发的组件也是相同的
  emits: Scroll.emits,
  render(ctx) {
    // ctx可以理解为this，上下文实例
    return h(Scroll, mergeProps({ ref: 'scrollRef' }, ctx.$props, {
      onScroll: (e) => {
        ctx.$emit('scroll', e)
        // 派发一个scroll事件
      }
    }), {
      // 第三个参数
      default: withCtx(() => {
        // withCtx 包装了 default 插槽的内容，以确保它在正确的上下文中执行。这样，你可以在组件中正常使用 default 插槽的内容。
        return [renderSlot(ctx.$slots, 'default')]
      })
    })
  },
  setup() {
    const scrollRef = ref(null)
    const scroll = computed(() => {
      return scrollRef.value.scroll
    })
    const store = useStore()
    const playlist = computed(() => store.state.playlist)

    watch(playlist, async () => {
      await nextTick()
      scroll.value.refresh()
    })

    return {
      scrollRef,
      scroll
    }
  }
}

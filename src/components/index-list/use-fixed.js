import { ref, watch, computed, nextTick } from 'vue'

export default function useFixed(props) {
  const TITLE_HEIGHT = 30
  const groupRef = ref(null)
  const listHeights = ref([])
  const scrollY = ref(0)
  const currentIndex = ref(0)
  const distance = ref(0)
  const fixedTitle = computed(() => {
    // 用条件判断去把下拉时的标题栏给去掉
    if (scrollY.value < 0) {
      return ''
    }
    const currentGroup = props.data[currentIndex.value]
    return currentGroup ? currentGroup.title : ''
  })

    const fixedStyle = computed(() => {
      // 让顶部标题栏更加自然的把上个标题栏顶掉，需要主要distance要在下面的watch中获取
      const distanceVal = distance.value
      const diff = (distanceVal > 0 && distanceVal < TITLE_HEIGHT) ? distanceVal - TITLE_HEIGHT : 0
      return {
        transform: `translate3d(0, ${diff}px, 0)`
      }
    })

//   watch数据变化
    watch(() => props.data, async () => {
      await nextTick()
      calculate()
    })

    watch(scrollY, (newY) => {
      const listHeightsVal = listHeights.value
      for (let i = 0; i <= listHeightsVal.length - 1; i++) {
        const heightTop = listHeightsVal[i]
        const heightBottom = listHeightsVal[i + 1]
        if (newY >= heightTop && newY <= heightBottom) {
          currentIndex.value = i
          distance.value = heightBottom - newY
        }
      }
    })

    function calculate() {
      const list = groupRef.value.children
    //   先用list存储获取到的ul下的子元素
      const listHeightsVal = listHeights.value
      let height = 0

      listHeightsVal.length = 0
      listHeightsVal.push(height)
      for (let i = 0; i < list.length; i++) {
        // 遍历获取滑动过程中，两个标题栏之间的差距
        height += list[i].clientHeight
        listHeightsVal.push(height)
      }
  }
  function onScroll(pos) {
    scrollY.value = -pos.y
    // -pos.y因为向下滑动，取得负值，所以height要获取到y值需要取负
  }
  return {
    groupRef,
    onScroll,
    fixedTitle,
    fixedStyle,
    currentIndex
  }
}

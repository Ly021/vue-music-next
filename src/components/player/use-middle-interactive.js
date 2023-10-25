// 用于封装歌曲页面转换时候的逻辑
import { ref } from 'vue'
export default function useMiddleInteractive() {
  const currentShow = ref('cd')
  // 设置歌曲页面默认值为cd样式,
  const middleLStyle = ref(null)
  const middleRStyle = ref(null)
  const touch = {}
  let currentView = 'cd'
  function onMiddleTouchStart(e) {
    touch.startX = e.touches[0].pageX
    touch.startY = e.touches[0].pageY
    touch.directionLocked = ''
    // 定义一个方向锁
  }
  function onMiddleTouchMove(e) {
    const deltaX = e.touches[0].pageX - touch.startX
    // 滑动偏移量,用当前获得的X去减掉起始获取到的X
    const deltaY = e.touches[0].pageY - touch.startY
    const absDeltaX = Math.abs(deltaX)
    const absDeltaY = Math.abs(deltaY)
    // DeltaX或Y可能是负值,所以加绝对值

    if (!touch.directionLocked) {
      touch.directionLocked = absDeltaX >= absDeltaY ? 'h' : 'v'
      // 先比较横坐标和纵坐标偏移量,判断并赋值directionLocked是横向还是纵向
    }
    if (touch.directionLocked === 'v') {
      return
      // 如果是纵向偏移,就直接return,这样就不会上下移动了(滑动功能优化)[方向锁]
    }

    const left = currentView === 'cd' ? 0 : -window.innerWidth
    const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX))
    // 最终偏移量,需要加上屏幕的宽度
    touch.percent = Math.abs(offsetWidth / window.innerWidth)
    if (currentView === 'cd') {
      if (touch.percent > 0.2) {
        currentShow.value = 'lyric'
      } else {
        currentShow.value = 'cd'
      }
    } else {
      if (touch.percent < 0.8) {
        currentShow.value = 'cd'
      } else {
        currentShow.value = 'lyric'
      }
    }
    middleLStyle.value = {
      opacity: 1 - touch.percent,
      // opacity表示不透明度的值,0-1之间
      transtionDuration: '0ms'
      // 设置过渡持续时间为0毫秒
    }
    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      transitionDuration: '0ms'
    }
  }

  function onMiddleTouchEnd(e) {
    let offsetWidth
    let opacity
    if (currentShow.value === 'cd') {
      currentView = 'cd'
      offsetWidth = 0
      opacity = 1
    } else {
      currentView = 'lyric'
      offsetWidth = -window.innerWidth
      opacity = 0
    }

    const duration = 300
    middleLStyle.value = {
      opacity,
      transitionDuration: `${duration}ms`
    }
    middleRStyle.value = {
      transform: `translate3d(${offsetWidth}px, 0, 0)`,
      transitionDuration: `${duration}ms`
      // cd和歌词之间变得更加丝滑顺畅
    }
  }

  return {
    currentView,
    onMiddleTouchStart,
    onMiddleTouchMove,
    onMiddleTouchEnd,
    middleLStyle,
    middleRStyle,
    currentShow
  }
}

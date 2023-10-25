// 封装全屏切换过渡效果的动画
import { ref } from 'vue'
import animations from 'create-keyframe-animation'
export default function useAnimation() {
  let entering = false
  let leaving = false
  // entering和leaving两个标志位
  const cdWrapperRef = ref(null)

  function enter(el, done) {
    if (leaving) {
      // 执行前先判断是否存在leaving函数，如果存在就用after Leave关闭他
      afterLeave()
    }
    entering = true
    const { x, y, scale } = getPosAndScale()

    const animation = {
      // 使用时需要在package.json中引入create-keyframe-animation
      // 0表示一开始的位置，animition是一个过渡对象,100是最终状态,100代表100帧
      0: {
        transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`
      },
      100: {
        transform: 'translate3d(0, 0, 0) scale(1)'
      }
    }
    // enter本质上事异步过程，执行一段有播放时长的动画，如果在动画未执行完之前执行leave，就会导致animationend不执行，无法回调，会将逻辑打乱
    animations.registerAnimation({
      // 注册动画
      name: 'move',
      animation,
      presets: {
        duration: 600,
        easing: 'cubic-bezier(0.45, 0, 0.55, 1)'
        // 设置了一些预设选项，动画持续时间（duration）和缓动函数（easing）
      }
    })
    // 调用done回调函数表示，该function已经进行完了，这样才能进入下一个function
    animations.runAnimation(cdWrapperRef.value, 'move', done)
    // animations.runAnimation(dom, '动画名称', 执行完的回调函数)
  }

  function afterEnter() {
    entering = false
    // Vue 过渡动画的进入阶段完成后执行，用于注销move的动画并重置相关元素的动画属性
    animations.unregisterAnimation('move')
    cdWrapperRef.value.animation = ''
  }

  function leave(el, done) {
    if (entering) {
      // 与enter方法同理，如果leave方法执行过程中，存在entering则需要将其关闭再去执行afterEnter()
      afterEnter()
    }
    leaving = true
    const { x, y, scale } = getPosAndScale()
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = 'all .6s cubic-bezier(0.45, 0, 0.55, 1)'
    cdWrapperEl.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${scale})`
    cdWrapperEl.addEventListener('transitionend', next)
    // 绑定dom监听事件，监听动画结束
    function next() {
      cdWrapperEl.removeEventListener('transitionend', next)
      // 动画结束后解绑事件
      done()
      console.log('动画结束')
    }
  }

  function afterLeave() {
    leaving = false
    const cdWrapperEl = cdWrapperRef.value

    cdWrapperEl.style.transition = ''
    cdWrapperEl.style.transform = ''
  }

  function getPosAndScale() {
    // 获取到X和Y值的偏移量
    const targetWidth = 40
    // 小cd的宽度为40
    const paddingLeft = 40
    const paddingBottom = 30
    // left和bottom是缩小时cd框的距左，距底
    const paddingTop = 80
    const width = window.innerWidth * 0.8
    const x = -(window.innerWidth / 2 - paddingLeft)
    const y = window.innerHeight - width / 2 - paddingTop - paddingBottom
    // 缩放scale
    const scale = targetWidth / width
    return {
      x,
      y,
      scale
    }
  }

  return {
    enter,
    afterEnter,
    leave,
    afterLeave,
    cdWrapperRef
  }
}

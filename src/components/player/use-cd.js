// 用于控制暂停歌曲时，动画旋转也可以停止
import { useStore } from 'vuex'
import { computed, ref, watch } from 'vue'
export default function useCd() {
  const cdRef = ref(null)
  const cdImageRef = ref(null)
  const store = useStore()
  const playing = computed(() => store.state.playing)

  const cdCls = computed(() => {
    return playing.value ? 'playing' : ''
  })

  watch(playing, (newPlaying) => {
    if (!newPlaying) {
      syncTransform(cdRef.value, cdImageRef.value)
    }
  })

  function syncTransform(wrapper, inner) {
    const innerTransform = getComputedStyle(inner).transform
    // 获得内层旋转角度
    const wrapperTransform = getComputedStyle(wrapper).transform
    wrapper.style.transform = wrapperTransform === 'none' ? innerTransform : innerTransform.concat(' ', wrapperTransform)
    // 如果wrapperTransform是首次被赋值，则为innerTransform，若已赋值过则需要叠加原来的角度，这样才能保证cd旋转时候的内层与外层角度一致，不发生偏移
    // concat是用于叠加角度的一种形式
  }

  return {
    cdCls,
    cdRef,
    cdImageRef
  }
}

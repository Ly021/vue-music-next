// 该文件用于执行歌词方面的钩子函数
import { useStore } from 'vuex'
import { computed, watch, ref } from 'vue'
import { getLyric } from '../../service/song'
import Lyric from 'lyric-parser'

export default function useLyric({ songReady, currentTime }) {
  const currentLyric = ref(null)
  const currentLineNum = ref(0)
  const pureMusicLyric = ref('')
  const lyricScrollRef = ref(null)
  const lyricListRef = ref(null)
  const playingLyric = ref('')

  const store = useStore()
  const currentSong = computed(() => store.getters.currentSong)

  watch(currentSong, async(newSong) => {
    if (!newSong.url || !newSong.id) {
      return
    }
    stopLyric()
    currentLyric.value = null
    currentLineNum.value = 0
    pureMusicLyric.value = ''
    playingLyric.value = ''
    // 假设在获取lyric之前就有lyric存在,所以需要先执行一个stop操作,避免出现bug,再将currentLyric置为null,防止再下次songReady时play歌词又出现bug.
    const lyric = await getLyric(newSong)
    store.commit('addSongLyric', {
      song: newSong,
      lyric
    })
    if (currentSong.value.lyric !== lyric) {
      return
    }

    currentLyric.value = new Lyric(lyric, handleLyric)
    const hasLyric = currentLyric.value.lines.length
    if (hasLyric) {
      // 每次添加新歌曲会执行handleLyric回调函数去添加新的lyric。
      if (songReady.value) {
      // 判断songReady这个异步操作是否为true再去执行播放这个逻辑
      playLyric()
      // songReady是定义在player中，所以要作为lyric的参数传进去
    } else {
      playingLyric.value = pureMusicLyric.value = lyric.replace(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')
      // 如果hasLyric为空说明没有歌词,则用replace将歌词中的内容替换.(/\[(\d{2}):(\d{2}):(\d{2})\]/g, '')为正则表达式,替换长度为2的数字
    }
  }
})

  function handleLyric({ lineNum, txt }) {
    currentLineNum.value = lineNum
    playingLyric.value = txt
    // 更新当前歌词行
    const scrollComp = lyricScrollRef.value
    // 命名时，组件实例用Comp结尾，dom实例用El结尾
    const listEl = lyricListRef.value
    if (!listEl) {
      // 如果没有获取到歌词列表则直接return
      return
    }
    if (lineNum > 5) {
      const lineEl = listEl.children[lineNum - 5]
      // 在第五行之后需要将高亮固定在屏幕正中，所以需要获取到line的dom，通过listEl的children即可获取
      scrollComp.scroll.scrollToElement(lineEl, 1000)
      // 通过scrollToElement这个方法，滚到lineEl这里，时间为1s
    } else {
      scrollComp.scroll.scrollTo(0, 0, 1000)
      // 在前6行时，不需要滚动，则设定滚动到顶部时即可
    }
  }

  function playLyric() {
    // 播放歌词
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.seek(currentTime.value * 1000)
      // *1000是因为寻找移动的时间点是以毫秒为单位的音频或视频的时间
    }
  }

  function stopLyric() {
    // 播放歌词
    const currentLyricVal = currentLyric.value
    if (currentLyricVal) {
      currentLyricVal.stop()
    }
  }

  return {
    currentLyric,
    currentLineNum,
    lyricListRef,
    lyricScrollRef,
    playLyric,
    stopLyric,
    pureMusicLyric,
    playingLyric
  }
}

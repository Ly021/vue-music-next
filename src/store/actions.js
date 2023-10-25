import { PLAY_MODE } from '@/assets/js/constant'
import { shuffle } from '@/assets/js/util'

export function selectPlay({ commit }, { list, index }) {
  commit('setPlayMode', PLAY_MODE.sequence)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlaylist', list)
  commit('setCurrentIndex', index)
}

export function randomPlay({ commit }, list) {
  commit('setPlayMode', PLAY_MODE.random)
  commit('setSequenceList', list)
  commit('setPlayingState', true)
  commit('setFullScreen', true)
  commit('setPlaylist', shuffle(list))
  commit('setCurrentIndex', 0)
}

export function changeMode({ commit, state, getters }, mode) {
  const currentId = getters.currentSong.id
  if (mode === PLAY_MODE.random) {
    commit('setPlaylist', shuffle(state.sequenceList))
  } else {
    commit('setPlaylist', state.sequenceList)
  }
  const index = state.playlist.findIndex((song) => {
    return song.id === currentId
  })

  commit('setCurrentIndex', index)
  commit('setPlayMode', mode)
}

export function removeSong({ commit, state }, song) {
  const sequenceList = state.sequenceList.slice()
  const playlist = state.playlist.slice()
  // .slice是创建副本, 不能够直接修改, 因为vuex只允许通过mutations去修改

  const sequenceIndex = findIndex(sequenceList, song)
  const playIndex = findIndex(playlist, song)

  if (sequenceIndex < 0 || playIndex < 0) {
    // 如果没有找到歌曲则直接return
    return
  }

  sequenceList.splice(sequenceIndex, 1)
  // splice() 方法的第一个参数 sequenceIndex 是要删除元素的起始索引位置，第二个参数 1 表示要删除的元素数量。
  playlist.splice(playIndex, 1)

  let currentIndex = state.currentIndex
  if (playIndex < currentIndex || currentIndex === playlist.length) {
    //  检查 playIndex 是否小于 currentIndex，也就是用户选择的曲目是否在当前播放曲目之前||检查 currentIndex 是否等于播放列表的长度，这可能意味着当前播放的是最后一首曲目。
    currentIndex--
  }

  commit('setSequenceList', sequenceList)
  commit('setPlaylist', playlist)
  commit('setCurrentIndex', currentIndex)
  if (!playlist.length) {
    commit('setPlayingState', false)
  }
}

function findIndex(list, song) {
  return list.findIndex((item) => {
    return item.id === song.id
  })
}

export function clearSongList({ commit }) {
  commit('setSequenceList', [])
  commit('setPlaylist', [])
  commit('setCurrentIndex', 0)
  commit('setPlayingState', false)
}

export function addSong({ commit, state }, song) {
  const playlist = state.playlist.slice()
  const sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  const playIndex = findIndex(playlist, song)
  if (playIndex > -1) {
    // 如果添加歌曲在播放列表中，则修改currentIndex为playIndex即可
    currentIndex = playIndex
  } else {
    // 如果查找不到添加歌曲，则将song添加到playlist中，然后将其currentIndex置在playlist末尾处
    playlist.push(song)
    currentIndex = playlist.length - 1
  }

  const sequenceIndex = findIndex(sequenceList, song)
  if (sequenceIndex === -1) {
    // 如果sequenceIndex===-1说明这首歌不在sequenceList中存在，则添加到sequenceList中
    sequenceList.push(song)
  }
  commit('setSequenceList', sequenceList)
  commit('setPlaylist', playlist)
  commit('setCurrentIndex', currentIndex)
  commit('setFullScreen', true)
  commit('setPlayingState', true)
}

import { get } from './base'

export function getSingerList() {
  return get('/api/getSingerList')
}

export function getSingerDetail(singer) {
  return get('/api/getSingerDetail', {
    mid: singer.mid // 传递一个query.id
    })
}

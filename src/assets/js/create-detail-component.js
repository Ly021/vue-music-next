import MusicList from '@/components/music-list/music-list'
import storage from 'good-storage'
import { processSongs } from '@/service/song'

export default function createDetailComponent(name, key, fetch) {
  return {
    name,
    props: {
      data: Object
    },
    components: { MusicList },
    data() {
      return {
        songs: [],
        loading: true
      }
    },
    computed: {
      computedData() {
        let ret = null
        const data = this.data
        if (data) {
          ret = data
        } else {
          const cached = storage.session.get(key)
            if (cached && (cached.mid || cached.id + '') === this.$route.params.id) {
              // 两者需要相同的数据类型才能相比较，所以将cached.id转为字符类型
              ret = cached
            }
        }
        return ret
      },
      pic() {
        const data = this.computedData
        return data && data.pic
      },
      title() {
        const data = this.computedData
        return data && (data.name || data.title)
      }
    },
    async created() { // 异步请求所以用async
      // if (!this.computedData) { // 避免修改地址栏导致获取不到对于的id值，做一个过滤，使得回到上一级路由，显得合理
      //   const path = this.$route.matched[0].path
      //   this.$router.push({
      //     path
      //   })
      //   return
      // }
      // const result = await fetch(this.computedData)
      const data = this.computedData
      // 每次去调用this.computedData就会造成一次依赖收集，如果用data直接去存储就能减少冗余
      if (!data) {
        const path = this.$route.matched[0].path
        this.$router.push({
          path
        })
        return
      }
      const result = await fetch(data)
      this.songs = await processSongs(result.songs)
      this.loading = false
    },
    methods: {
      selectSinger(data) {
        this.selectedData = data
      }
    }
  }
}

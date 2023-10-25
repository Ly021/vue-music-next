// 工具函数，导出洗牌函数
export function shuffle (source) {
    const arr = source.slice()
    for (let i = 0; i < arr.length; i++) {
      const j = getRandomInt(i)
      swap(arr, i, j)
    }
    return arr
  }

// 辅助方法
function getRandomInt(max) {
    return Math.floor(Math.random() * (max + 1))
}

function swap(arr, i, j) {
    // i和j的交换
    const t = arr[i]
    arr[i] = arr[j]
    arr[j] = t
}

export function formatTime(interval) {
  interval = interval | 0
  const minute = ((interval / 60 | 0) + '').padStart(2, '0')
  // padStart表示填充，上面的例子表示不足两位填充一个0，满足两位不需要填充
  const second = (interval % 60 + '').padStart(2, '0')
  return `${minute}:${second}`
}

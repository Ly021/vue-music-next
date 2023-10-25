import storage from 'good-storage'

function insertArray (arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) {
    return
  }
  if (index > 0) {
    // 说明在数组中但不在队首
    arr.splice(index, 1)
    // 先删除，在unshift则可以添加到队首
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) {
    arr.pop()
  }
}

function deleteFromArray (arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

export function save (item, key, compare, maxLen) {
  // item存储元素的对象， key是存储在本地存储的关键字， compare用来匹配相等的一个过程，如果是相同关键字则不需要重复保留，maxLen是最大保留长度。
  const items = storage.get(key, [])
  // 这行代码的作用是尝试从存中获取与给定 key 相关的数据。如果成功获取数据，它将存情在 items 变量中;如果无法获取数据，或者 key 不存在，那么将使item为[]
  insertArray(items, item, compare, maxLen)
  storage.set(key, items)
  return items
}

export function remove (key, compare) {
  const items = storage.get(key, [])
  deleteFromArray(items, compare)
  storage.set(key, items)
  // items、item 和 compare。 它的作用是向数组 items 中插入一个新的素 tem，并使用比较函数 compare 来确定插入的位置
  // 在内部定义compare函数，但compare函数的内部细节由外部去定义即可，
  return items
}

export function load (key) {
  return storage.get(key, [])
}

export function clear(key) {
  storage.remove(key)
  return []
}

export function saveAll(items, key) {
  storage.set(key, items)
}

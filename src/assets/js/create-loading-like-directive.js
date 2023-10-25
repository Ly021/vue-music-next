import { createApp } from 'vue'
import { addClass, removeClass } from './dom'
const relativeCls = 'g-relative'

export default function createLoadingLikeDirect(Comp) {
    return {
        mounted(el, binding) {
            const app = createApp(Comp)
            const instance = app.mount(document.createElement('div'))
            const name = Comp.name
            if (!el[name]) {
                el[name] = {}
            }
            // 如果一个两个指令都调用了此js文件，且都作用到同一个元素，使用同一个instance容易导致后面的append和move方法出错，因为mounted是相继触发的
            // el.instance = instance
            el[name].instance = instance
            const title = binding.arg
            if (typeof title !== 'undefined') {
                instance.setTitle(title)
            }
            if (binding.value) {
                append(el)
            }
        },
        updated(el, binding) {
            const name = Comp.name
            const title = binding.arg
            if (typeof title !== 'undefined') {
                el[name].instance.setTitle(title)
            }
            if (binding.value !== binding.oldValue) {
                binding.value ? append(el) : remove(el)
            }
        }
    }
    function append(el) {
        const name = Comp.name
        const style = getComputedStyle(el)
        // 判断作用元素el的定位是否absolute，fixed，relative这其中之一，如果不是的话就要给el添加一个相对定位样式。
        if (['fixed', 'relative', 'absolute'].indexOf(style.position) === -1) {
          addClass(el, relativeCls)
        }
        el.appendChild(el[name].instance.$el)
    }

    function remove(el) {
        const name = Comp.name
        removeClass(el, relativeCls)
        el.removeChild(el[name].instance.$el)
    }
}

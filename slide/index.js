/***
 * created by @vimmingshe@gmail.com
 * @date 01/05/2018 9:25 AM
 * @description:
 ***/

function slide(dom, config) {
    let opts = {
        min_h: "100px",
        min_w: "400px",
        children: [],
        _len: 0,
        _c_h: 0,
        _c_w: 0,
        beginX: 0,
        timeoutId: null,
        timeMs: 3000
    }
    let init = () => {
        if(dom instanceof Node){
            Object.assign(opts, config)
            let children = dom.children
            opts._len = children.length

            for(let item of children){
                let t = item.cloneNode(true)
                opts.children.push(t)
            }
            opts.children = Array.from(children).concat(opts.children)

            dom.innerHTML = ''
            dom.style.minWidth = opts.min_w
            dom.style.minHeight = opts.min_h
            dom.style.position = "relative"
            dom.style.overflow = "hidden"
            opts._c_h = dom.clientHeight
            opts._c_w = Math.floor(dom.clientWidth / opts._len)
            opts.beginX = -(opts._c_w*opts._len)

            opts.children.forEach((item, index) => {
                dom.appendChild(item)
                item.style.height = `${opts._c_h}px`
                item.style.width = `${opts._c_w}px`
                item.style.position = "absolute"
                item.style.transition = `transform 1s ease`
            })
            resetAnimation()
        }
    }

    let resetAnimation = () => {
        opts.children.forEach((item, index) => {
            item.style.opacity = index ? 1 : 0
            item.style.transform = `translateX(${opts.beginX + index*opts._c_w}px)`
        })
    }

    let animation = () => {
       if(opts.timeoutId) clearTimeout(opts.timeoutId)
       resetAnimation()
       opts.children.forEach((item) => {
            item.style.transform = item.style.transform.replace(/(\-?\d+)/, (num) => {
                return parseInt(num) + opts._c_w
            })
       })
       opts.children.unshift(opts.children.pop())

       opts.timeoutId = setTimeout(() => {
         animation()
       }, opts.timeMs)
    }


    init()

    opts.timeoutId = setTimeout(() => {
        animation()
    }, 1000)

}
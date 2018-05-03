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
        timeMs: 3000,
        resizeTimeoutId: null
    }
    /***************************
     *   初始化程序
     * *************************/
    let init = () => {
        if (dom instanceof Node) {
            Object.assign(opts, config)
            let children = dom.children
            /***********设置容器里面放多少个****************/
            opts._len = opts._len ? (opts._len < children.length ? opts._len : children.length) : children.length
            /**********************************
             *  如果容器里面放满， 就需要克隆一份
             *********************************/
            if (opts._len === children.length) {
                for (let item of children) {
                    let t = item.cloneNode(true)
                    opts.children.push(t)
                }
                dom.innerHTML = ''
            }
            opts.children = Array.from(children).concat(opts.children)

            /********************设置父容器的css************************/
            dom.style.minWidth = opts.min_w
            dom.style.minHeight = opts.min_h
            dom.style.position = "relative"
            dom.style.overflow = "hidden"
            /**************************************
             * 计算子元素的大小以及位置， 设置一些必要属性
             *************************************/
            calcChildPos()
            resetAnimation()
        }
    }

    let calcChildPos = () => {
        opts._c_h = dom.clientHeight
        opts._c_w = Math.floor(dom.clientWidth / opts._len)
        opts.beginX = -(opts._c_w * opts._len)

        opts.children.forEach((item) => {
            opts.children.length === dom.children.length && dom.appendChild(item)
            item.style.height = `${opts._c_h}px`
            item.style.width = `${opts._c_w}px`
            item.style.position = "absolute"
            item.style.transition = `transform 1s ease`
        })
    }

    let resetAnimation = () => {
        opts.children.forEach((item, index) => {
            item.style.opacity = index ? 1 : 0
            item.style.transform = `translateX(${opts.beginX + index * opts._c_w}px)`
        })
    }

    /*******************************
     * 动画效果的实现， 使用setTimeout
     *****************************/
    let animation = () => {
        if (opts.timeoutId) clearTimeout(opts.timeoutId)
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

    /*************************************
     *  dom加载完毕后执行 init , animation。
     *  以及添加必要的事件
     *************************************/
    document.addEventListener("DOMContentLoaded", () => {
        init()
        opts.timeoutId = setTimeout(() => {
            animation()
        }, 1000)

        window.addEventListener("resize", () => {
            if (opts.resizeTimeoutId) clearTimeout(opts.resizeTimeoutId)
            opts.resizeTimeoutId = setTimeout(() => {
                calcChildPos()
            }, 1000)
        })
        dom.addEventListener("mouseenter", () => {
            if (opts.timeoutId) clearTimeout(opts.timeoutId)
        })
        dom.addEventListener("mouseleave", () => {
            animation()
        })
    })
}
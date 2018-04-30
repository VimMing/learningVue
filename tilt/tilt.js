/***
 * created by @vimmingshe@gmail.com
 * @date 30/04/2018 9:39 AM
 * @description:
 ***/

function tilt(dom, config) {
    let opts = {
        _x: 0,
        _y: 0,
        _h: 0,
        _w: 0,
        perspective: "300px",
        debug: false,
        count: 0,
        weights: 1
    }

    let debugInfo = (info) => {
        if(opts.debug){
            console.log(info);
        }
    }

    if(dom instanceof Node){
        let pos = dom.getBoundingClientRect();
        let wrap = document.createElement('div');
        let domParent = dom.parentNode;
        if(config) Object.assign(opts, config)
        opts._h = pos.height
        opts._w = pos.width
        opts._x = pos.x + Math.floor(opts._w / 2)
        opts._y = pos.y + Math.floor(opts._h / 2)
        domParent.replaceChild(wrap, dom);
        wrap.appendChild(dom);
        wrap.style.perspective = opts.perspective
        dom.style.transition = "transform 0.5s ease"
        dom.style.cursor = "pointer"
    }

    dom.addEventListener('mousemove', (e)=> {
        if(++opts.count % 9 === 0){
            let {pageX: x, pageY: y} = e
            /**************************************
             *  dom 为一个平面， dom的中心坐标为 _x, _y, (_x, _y)为原点，建立坐标系x-y
             *  mouse: 的坐标为(x, y)
             *  rotateDegY 绕y轴旋转的度数, 当(x, y)在第一象限和第四象限时 > 0 , 反之。
             *  rotateDegX 绕X轴旋转的度数， 当(x, y)在第一象限和第四象限时 > 0 , 反之。
             ***************************************/
            let rotateDegY = ((x - opts._x) / (Math.floor(opts._w / 2)))*opts.weights,
                rotateDegX = ((opts._y - y) / (Math.floor(opts._h / 2)))*opts.weights
            dom.style.transform = `rotateX(${rotateDegX}deg) rotateY(${rotateDegY}deg)`
        }
    });
    dom.addEventListener('mouseleave', (e) => {
        dom.style.transform = `rotateX(0deg) rotateY(0deg)`
    });
}
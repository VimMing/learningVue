// 把string转换成被fragment包裹的DOM
// string -> DOM conversion
// wrappers originally from jQuery, scooped from component/domify


// 下面的数字代表层级， 比如 <fieldset></fieldset>为一层
//  <table><tbody></tbody></table>为两层
var map = {
    legend: [1, '<fieldset>', '</fieldset>'],
    tr: [2, '<table><tbody>', '</tbody></table>'],
    col: [2, '<table><tbody></tbody>', '</colgroup></table>'],
    _default: [0, '', '']
}

map.td =
    map.th = [3, '<table><tbody><tr>', '</tr></tbody></table>']
map.option =
    map.optgroup = [1, '<select multiple="multiple">', '</select>']

map.thead =
    map.tbody =
    map.colgroup =
    map.tfoot = [1, '<table>', '</table>']

map.text =
    map.circle =
    map.ellipse =
    map.line =
    map.path =
    map.polygon =
    map.polyline =
    map.rect = [1, '<svg xmlns="http://www.w3.org/2000/svg" version="1.1">', '</svg>']

var TAG_RE = /<([\w:]+)/

module.exports = function (templateString) {
    var frag = document.createDocumentFragment(),
        m = TAG_RE.exec(templateString)
    // text only
    if (!m) {
        frag.appendChild(document.createTextNode(templateString))
        return frag
    }

    var tag = m[1],
        wrap = map[tag] || map._default,
        depth = wrap[0],
        prefix = wrap[1],
        suffix = wrap[2],
        node = document.createElement('div')

    node.innerHTML = prefix + templateString.trim() + suffix
    while (depth--) node = node.lastChild

    // one element
    if (node.firstChild === node.lastChild) {
        frag.appendChild(node.firstChild)
        return frag
    }
    // multiple node, return a fragment
    var appendChild
    while (child = node.firstChild) {
        frag.appendChild(child)
    }
    return frag
}
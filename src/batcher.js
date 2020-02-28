/**************
 *  异步批量处理
 ***************/

var utils = require('./utils')

function Batcher() {
    this.reset()
}

var BatcherProto = Batcher.prototype

BatcherProto.reset = function () {
    this.has = utils.hash() // job.id为key
    this.queue = [] // 批量队列
    this.waiting = false // 是否需要等待批量处理
}

// 任务进队列
BatcherProto.push = function (job) {
    if (!job.id || !this.has[job.id]) {
        this.queue.push(job)
        this.has[job.id] = job
        if(!this.waiting){
            this.waiting = true
            utils.nextTick(utils.bind(this.flush, this))
        }
    }else if(job.override){ // 是否覆盖
        var oldJob = this.has[job.id]
        oldJob.cancelled = true // oldJob不执行
        this.queue.push(job)
        this.has[job.id] = job
    }
}

// 任务批量出队列执行
BatcherProto.flush = function () {
    // before flush hook
    if (this._preFlush) this._preFlush()
    // do not cache length because more jobs might be pushed
    // as we execute existing jobs
    for (var i = 0; i < this.queue.length; i++) {
        var job = this.queue[i]
        if (!job.cancelled) {
            job.execute()
        }
    }
    this.reset()
}

module.exports = Batcher
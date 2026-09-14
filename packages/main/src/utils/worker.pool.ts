import { AsyncResource } from 'async_hooks'
import { EventEmitter } from 'events'
import { Worker } from 'worker_threads'

const kTaskInfo = Symbol('kTaskInfo')
const kWorkerFreedEvent = Symbol('kWorkerFreedEvent')

class WorkerPoolTaskInfo extends AsyncResource {
  callback: any
  constructor(callback: any) {
    super('WorkerPoolTaskInfo')
    this.callback = callback
  }

  done(err: Error, result: any) {
    this.runInAsyncScope(this.callback, null, err, result)
    this.emitDestroy() // `TaskInfo`s are used only once.
  }
}

export class WorkerPool extends EventEmitter {
  private tasks: any = []
  private numThreads: any
  private workers: Worker[] = []
  private freeWorkers: Worker[] = []
  constructor(numThreads: number, script: string) {
    super()
    this.numThreads = numThreads

    for (let i = 0; i < numThreads; i++) this.addNewWorker(script)

    // Any time the kWorkerFreedEvent is emitted, dispatch
    // the next task pending in the queue, if any.
    this.on(kWorkerFreedEvent, () => {
      if (this.tasks.length > 0) {
        const { task, callback } = this.tasks.shift()
        this.runTask(task, callback)
      }
    })
  }

  addNewWorker(script: string): void {
    const worker = new Worker(script, { eval: true })
    worker.on('message', (result) => {
      // In case of success: Call the callback that was passed to `runTask`,
      // remove the `TaskInfo` associated with the Worker, and mark it as free
      // again.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      worker[kTaskInfo].done(null, result)
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      worker[kTaskInfo] = null
      this.freeWorkers.push(worker)
      this.emit(kWorkerFreedEvent)
    })
    worker.on('error', (err) => {
      // In case of an uncaught exception: Call the callback that was passed to
      // `runTask` with the error.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      if (worker[kTaskInfo]) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        worker[kTaskInfo]?.done(err, null)
      } else this.emit('error', err)
      // Remove the worker from the list and start a new Worker to replace the
      // current one.
      this.workers.splice(this.workers.indexOf(worker), 1)
      this.addNewWorker(script)
    })
    this.workers.push(worker)
    this.freeWorkers.push(worker)
    this.emit(kWorkerFreedEvent)
  }

  runTask<T>(task: unknown, callback: (err: Error, data: T) => void): void {
    if (this.freeWorkers.length === 0) {
      // No free threads, wait until a worker thread becomes free.
      this.tasks.push({ task, callback })
      return
    }

    const worker = this.freeWorkers.pop()
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    worker[kTaskInfo] = new WorkerPoolTaskInfo(callback)
    worker?.postMessage(task)
  }

  close(): void {
    for (const worker of this.workers) worker.terminate()
  }
}

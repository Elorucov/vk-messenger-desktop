import { APIRequest } from '../helpers';
import { SequentialWorker } from './sequential';
import { getChainReturn } from '../utils/getChainReturn';
import { resolveExecuteTask } from '../utils/resolveExecuteTask';
export class ParallelWorker extends SequentialWorker {
    async execute() {
        const { queue } = this;
        // Если метод нельзя выполнять в execute - выполняем его в порядке очереди через обычный вызов
        // Основной метод вызывается циклично - все не разрешенные методы оказываются сверху
        if (this.isAllowedMethod(queue[0].method)) {
            super.execute();
            return;
        }
        const { executeCount } = this.api.options;
        const tasks = [];
        for (let i = 0; i < this.queue.length; i += 1) {
            if (this.isAllowedMethod(queue[i].method)) {
                continue;
            }
            tasks.push(queue.splice(i, 1)[0]);
            i -= 1;
            if (tasks.length >= executeCount) {
                break;
            }
        }
        if (tasks.length === 0) {
            return;
        }
        const request = new APIRequest({
            api: this.api,
            method: 'execute',
            params: {
                code: getChainReturn(tasks.map(String))
            }
        });
        super.execute(request);
        try {
            resolveExecuteTask(tasks, await request.promise);
        }
        catch (error) {
            for (const task of tasks) {
                task.reject(error);
            }
        }
    }
    isAllowedMethod(method) {
        return (method.startsWith('execute') || this.api.options.executeUnsupportedMethods.includes(method));
    }
}
//# sourceMappingURL=parallel.js.map
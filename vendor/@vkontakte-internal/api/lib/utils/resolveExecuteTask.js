export function resolveExecuteTask(tasks, result) {
    let currentErrorIndex = 0;
    result.response.forEach((response, i) => {
        const task = tasks[i];
        if (response !== false) {
            task.resolve(response);
            return;
        }
        task.reject(result.errors[currentErrorIndex]);
        currentErrorIndex++;
    });
}
//# sourceMappingURL=resolveExecuteTask.js.map
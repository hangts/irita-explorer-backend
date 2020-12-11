export async function getTaskStatus(taskModel:any): Promise<boolean>{
    let count: number = await taskModel.queryTaskCount()
    return count > 0
}
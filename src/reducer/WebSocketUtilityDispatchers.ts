import { IMessage } from "react-stomp-hooks";
import { Action } from "redux";
import { ThunkDispatch } from "../util/Types";
import { LongRunningTask } from "../model/LongRunningTask";
import { asyncActionSuccessWithPayload } from "../action/SyncActions";

export function updateLongRunningTasks(message: IMessage, action: Action) {
  return async (dispatch: ThunkDispatch) => {
    const tasks: [LongRunningTask] = JSON.parse(message.body);
    const mapped: { [uuid: string]: LongRunningTask } = {};

    tasks.forEach((task) => {
      if (task.startedAt) {
        // @ts-ignore
        task.startedAt = new Date(task.startedAt * 1000);
      }

      task.name = "longrunningtasks.name." + task.name;

      mapped[task.uuid] = task;
    });

    dispatch(asyncActionSuccessWithPayload(action, mapped));
  };
}

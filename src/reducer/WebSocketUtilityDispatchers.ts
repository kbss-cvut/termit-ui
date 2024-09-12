import { IMessage } from "react-stomp-hooks";
import { Action } from "redux";
import { ThunkDispatch } from "../util/Types";
import { LongRunningTask } from "../model/LongRunningTask";
import {
  asyncActionSuccess,
  asyncActionSuccessWithPayload,
} from "../action/SyncActions";

export function updateLongRunningTasks(message: IMessage, action: Action) {
  return async (dispatch: ThunkDispatch) => {
    if (message.headers["reset"]) {
      dispatch(asyncActionSuccess(action));
      return;
    }

    const tasks: { [uuid: string]: LongRunningTask } = JSON.parse(message.body);

    const mapped = Object.keys(tasks).map((uuid) => {
      const task = tasks[uuid];
      if (task.startedAt) {
        // @ts-ignore
        task.startedAt = new Date(task.startedAt * 1000);
        task.startedAt.setMilliseconds(0); // round to second
      }

      task.name = "longrunningtasks.name." + task.name;
      return task;
    });

    dispatch(asyncActionSuccessWithPayload(action, mapped));
  };
}

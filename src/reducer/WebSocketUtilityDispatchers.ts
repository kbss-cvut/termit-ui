import { IMessage } from "react-stomp-hooks";
import { Action } from "redux";
import { ThunkDispatch } from "../util/Types";
import {
  LongRunningTask,
  LongRunningTaskState,
} from "../model/LongRunningTask";
import { isNumber, isString } from "lodash";
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

    const task: LongRunningTask = JSON.parse(message.body);

    if (
      !(
        task &&
        task.state &&
        isString(task.name) &&
        LongRunningTaskState[task.state] &&
        (isNumber(task.startedAt) || !task.startedAt)
      ) ||
      task.name.trim() === ""
    ) {
      return;
    }

    if (task.startedAt) {
      task.startedAt = new Date(task.startedAt * 1000);
    }

    task.name = "longrunningtasks.name." + task.name;

    dispatch(asyncActionSuccessWithPayload(action, task));
  };
}

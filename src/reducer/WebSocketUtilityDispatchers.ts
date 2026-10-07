import { IMessage } from "react-stomp-hooks";
import { Action } from "redux";
import { ThunkDispatch } from "../util/Types";
import { LongRunningTask } from "../model/LongRunningTask";
import {
  asyncActionSuccessWithPayload,
  publishSuccessMessage,
} from "../action/SyncActions";
import { IriMigrationPair, IriMigrationType } from "../model/IriMigrationType";
import { loadVocabularies, loadVocabulary } from "../action/AsyncActions";
import TermItState from "../model/TermItState";
import VocabularyUtils from "../util/VocabularyUtils";
import { useLocation } from "react-router-dom";

export function updateLongRunningTasks(message: IMessage, action: Action) {
  return async (dispatch: ThunkDispatch) => {
    const tasks: [LongRunningTask] = JSON.parse(message.body);
    const mapped: { [uuid: string]: LongRunningTask } = {};

    tasks.forEach((task) => {
      if (task.startedAt) {
        // parse ISO-8601 timestamp string
        task.startedAt = new Date(task.startedAt);
      }

      task.name = "longrunningtasks.name." + task.name;

      mapped[task.uuid] = task;
    });

    dispatch(asyncActionSuccessWithPayload(action, mapped));
  };
}

interface IdentifierMigrationCompletedEventPayload {
  type: IriMigrationType;
  iris: IriMigrationPair;
}

export function onIdentifierMigrationCompleted(message: IMessage) {
  return async (dispatch: ThunkDispatch, state: TermItState) => {
    const {} = useLocation();
    const payload: IdentifierMigrationCompletedEventPayload = JSON.parse(
      message.body
    );
    // TODO propagate async error
    const promises: Promise<any>[] = [];

    if (payload.type === IriMigrationType.VOCABULARY) {
      // reload vocabulary list
      promises.push(dispatch(loadVocabularies()));
    }

    if (state.vocabulary?.iri) {
      // reload current vocabulary
      promises.push(
        dispatch(loadVocabulary(VocabularyUtils.create(state.vocabulary.iri)))
      );
    }

    // todo: navigation?

    Promise.all(promises).then(() =>
      dispatch(
        publishSuccessMessage({
          messageId: "asset.migrate.iri.completed",
        })
      )
    );
  };
}

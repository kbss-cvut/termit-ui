import { IMessage } from "react-stomp-hooks";
import { Action } from "redux";
import { ThunkDispatch } from "../util/Types";
import { LongRunningTask } from "../model/LongRunningTask";
import {
  asyncActionSuccessWithPayload,
  publishMessage,
  publishSuccessMessage,
} from "../action/SyncActions";
import { IriMigrationPair, IriMigrationType } from "../model/IriMigrationType";
import Routing from "../util/Routing";
import Routes from "../util/Routes";
import VocabularyUtils from "../util/VocabularyUtils";
import Message from "../model/Message";
import MessageType from "../model/MessageType";
import { getCustomAttributes } from "../action/AsyncCustomizationActions";

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
  migrationType: IriMigrationType;
  iris: IriMigrationPair;
}

interface IdentifierMigrationFailedEvent {
  message: string;
  messageId?: string;
}

export function onIdentifierMigrationCompleted(message: IMessage) {
  return (dispatch: ThunkDispatch) => {
    const payload:
      | IdentifierMigrationCompletedEventPayload
      | IdentifierMigrationFailedEvent = JSON.parse(message.body);

    if (!("iris" in payload)) {
      console.error(payload);
      dispatch(
        publishMessage(
          new Message(
            {
              ...payload,
            },
            MessageType.ERROR
          )
        )
      );
      return;
    }

    let promise: Promise<any> | undefined = undefined;

    if (payload.migrationType === IriMigrationType.VOCABULARY) {
      // vocabulary identifier changed, navigating to new location
      const vocabularyUri = VocabularyUtils.create(payload.iris.newIri);
      Routing.transitionTo(Routes.vocabularySummary, {
        params: new Map().set("name", vocabularyUri.fragment),
        query: new Map().set("namespace", vocabularyUri.namespace),
      });
    } else if (payload.migrationType === IriMigrationType.TERM) {
      Routing.reload();
    } else if (payload.migrationType === IriMigrationType.CUSTOM_ATTRIBUTE) {
      promise = dispatch(getCustomAttributes());
    }

    Promise.all([promise]).then(() => {
      dispatch(
        publishSuccessMessage({
          messageId: "asset.migrate.iri.completed",
        })
      );
    });
  };
}

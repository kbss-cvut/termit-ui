import * as React from "react";
import { useEffect, useMemo, useState } from "react";
import {
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  UncontrolledDropdown,
} from "reactstrap";
import "./LongRunningTasksStatus.scss";
import classNames from "classnames";
import Mask from "../misc/Mask";
import { useSelector } from "react-redux";
import TermItState from "../../model/TermItState";
import { useI18n } from "../hook/useI18n";
import {
  LongRunningTask,
  LongRunningTaskState,
} from "../../model/LongRunningTask";
import { isEqual, padStart } from "lodash";
import If from "../misc/If";

function icon(task: LongRunningTask, i18n: (id?: string) => string) {
  switch (task.state) {
    case LongRunningTaskState.DONE:
      return (
        <i
          className="fas fa-check"
          title={i18n("longrunningtasks.state.done")}
        />
      );
    case LongRunningTaskState.PENDING:
      return (
        <i
          className="far fa-clock"
          title={i18n("longrunningtasks.state.pending")}
        />
      );
    case LongRunningTaskState.RUNNING:
      return (
        <i
          className="fas fa-bars-progress"
          title={i18n("longrunningtasks.state.running")}
        />
      );
    default:
      return <i className="fas fa-question" />;
  }
}

export const LongRunningTasksStatus: React.FC = () => {
  const runningTasks = useSelector(
    (state: TermItState) => state.runningTasks,
    isEqual
  );
  const { i18n } = useI18n();

  const tasksToUpdate = useMemo<Set<() => void>>(() => new Set(), []);

  useEffect(() => {
    const timer = setInterval(() => {
      tasksToUpdate.forEach((task) => task());
    }, 250);
    return () => clearInterval(timer);
  }, [tasksToUpdate]);

  if (Object.keys(runningTasks).length === 0) {
    return null;
  }

  return (
    <UncontrolledDropdown nav={true} className="long-running-tasks-dropdown">
      <DropdownToggle
        nav={true}
        caret={false}
        className={classNames(
          "text-dark text-dropdown",
          "d-flex",
          "align-items-center",
          "long-running-tasks-toggle"
        )}
      >
        <Mask classes="align-middle" withoutText={true} />
      </DropdownToggle>
      <DropdownMenu
        className="dropdown-menu-arrow long-running-tasks-menu"
        right={true}
      >
        <DropdownItem
          text={true}
          className="dropdown-item-text long-running-tasks-label"
        >
          <p>{i18n("longrunningtasks.description")}</p>
        </DropdownItem>

        {Object.keys(runningTasks).map((uuid, i) => {
          const task = runningTasks[uuid];
          return (
            <DropdownItem
              key={"long-running-task-" + uuid + i}
              text={true}
              className="long-running-tasks-task"
            >
              {icon(task, i18n)}
              <span>{i18n(task.name)}</span>
              <If
                expression={
                  !!task.startedAt &&
                  task.state === LongRunningTaskState.RUNNING
                }
              >
                <span className="text-muted">
                  <DurationDisplay
                    since={task.startedAt!}
                    tasksToUpdate={tasksToUpdate}
                  />
                </span>
              </If>
            </DropdownItem>
          );
        })}
      </DropdownMenu>
    </UncontrolledDropdown>
  );
};

const DurationDisplay: React.FC<{
  since: Date;
  tasksToUpdate: Set<() => void>;
}> = ({ since, tasksToUpdate }) => {
  const tZero = useMemo(() => {
    if (since.getTime() > Date.now()) {
      return Date.now();
    }
    return since.getTime();
  }, [since]);

  const [time, setTime] = useState(0);
  useEffect(() => {
    const task = () => {
      setTime(Date.now() - tZero);
    };
    tasksToUpdate.add(task);

    return () => {
      tasksToUpdate.delete(task);
    };
  }, [tZero, tasksToUpdate]);

  const date = new Date(time);
  const hours = date.getUTCHours() > 0 ? date.getUTCHours() + ":" : "";
  const minutes = padStart(date.getUTCMinutes().toString(), 2, "0");
  const seconds = padStart(date.getUTCSeconds().toString(), 2, "0");

  return <>{`${hours}${minutes}:${seconds}`}</>;
};

export type LongRunningTask = {
  uuid: string;
  name: string;
  state: LongRunningTaskState;
  startedAt?: Date;
};

export enum LongRunningTaskState {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  DONE = "DONE",
}

import { HandlerModule } from "./types.js";
import { repositoriesModule } from "./repositories.js";
import { pullRequestsModule } from "./pull-requests.js";
import { prCommentsModule } from "./pr-comments.js";
import { prTasksModule } from "./pr-tasks.js";
import { prContentModule } from "./pr-content.js";
import { branchingModelModule } from "./branching-model.js";
import { pipelinesModule } from "./pipelines.js";
import { usersModule } from "./users.js";
import { refsModule } from "./refs.js";
import { commitsModule } from "./commits.js";
import { sourceModule } from "./source.js";

/**
 * All handler modules aggregated for registration
 */
export const allModules: HandlerModule[] = [
  repositoriesModule,
  pullRequestsModule,
  prCommentsModule,
  prTasksModule,
  prContentModule,
  branchingModelModule,
  pipelinesModule,
  usersModule,
  refsModule,
  commitsModule,
  sourceModule,
];

export {
  repositoriesModule,
  pullRequestsModule,
  prCommentsModule,
  prTasksModule,
  prContentModule,
  branchingModelModule,
  pipelinesModule,
  usersModule,
  refsModule,
  commitsModule,
  sourceModule,
};

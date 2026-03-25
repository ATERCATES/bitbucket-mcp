// =========== TYPE DEFINITIONS ===========

/**
 * Represents a hyperlink in Bitbucket API responses
 */
export interface BitbucketLink {
  href: string;
  name?: string;
}

/**
 * Represents a Bitbucket account (user or team)
 */
export interface BitbucketAccount {
  uuid: string;
  display_name: string;
  account_id: string;
  nickname?: string;
  type: "user" | "team";
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a Bitbucket workspace
 */
export interface BitbucketWorkspace {
  uuid: string;
  name: string;
  slug: string;
  type: "workspace";
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a Bitbucket project
 */
export interface BitbucketProject {
  uuid: string;
  key: string;
  name: string;
  description?: string;
  is_private: boolean;
  type: "project";
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a Bitbucket branch reference
 */
export interface BitbucketBranch {
  name: string;
  type: "branch";
}

/**
 * Represents a Bitbucket repository
 */
export interface BitbucketRepository {
  uuid: string;
  name: string;
  full_name: string;
  description: string;
  is_private: boolean;
  created_on: string;
  updated_on: string;
  size: number;
  language: string;
  has_issues: boolean;
  has_wiki: boolean;
  fork_policy: string;
  owner: BitbucketAccount;
  workspace: BitbucketWorkspace;
  project: BitbucketProject;
  mainbranch?: BitbucketBranch;
  website?: string;
  scm: string;
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a branch reference in a pull request
 */
export interface BitbucketBranchReference {
  branch: {
    name: string;
  };
  commit: {
    hash: string;
  };
  repository: BitbucketRepository;
}

/**
 * Represents a participant in a pull request
 */
export interface BitbucketParticipant {
  user: BitbucketAccount;
  role: "PARTICIPANT" | "REVIEWER";
  approved: boolean;
  state?: "approved" | "changes_requested" | null;
  participated_on: string;
}

/**
 * Represents a Bitbucket pull request
 */
export interface BitbucketPullRequest {
  id: number;
  title: string;
  description: string;
  state: "OPEN" | "MERGED" | "DECLINED" | "SUPERSEDED";
  author: BitbucketAccount;
  source: BitbucketBranchReference;
  destination: BitbucketBranchReference;
  created_on: string;
  updated_on: string;
  closed_on?: string;
  comment_count: number;
  task_count: number;
  close_source_branch: boolean;
  reviewers: BitbucketAccount[];
  participants: BitbucketParticipant[];
  links: Record<string, BitbucketLink[]>;
  summary?: {
    raw: string;
    markup: string;
    html: string;
  };
}

/**
 * Represents inline comment positioning information
 */
export interface InlineCommentInline {
  path: string;
  from?: number;
  to?: number;
}

/**
 * Represents a Bitbucket branching model
 */
export interface BitbucketBranchingModel {
  type: "branching_model";
  development: {
    name: string;
    branch?: BitbucketBranch;
    use_mainbranch: boolean;
  };
  production?: {
    name: string;
    branch?: BitbucketBranch;
    use_mainbranch: boolean;
  };
  branch_types: Array<{
    kind: string;
    prefix: string;
  }>;
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a Bitbucket branching model settings
 */
export interface BitbucketBranchingModelSettings {
  type: "branching_model_settings";
  development: {
    name: string;
    use_mainbranch: boolean;
    is_valid?: boolean;
  };
  production: {
    name: string;
    use_mainbranch: boolean;
    enabled: boolean;
    is_valid?: boolean;
  };
  branch_types: Array<{
    kind: string;
    prefix: string;
    enabled: boolean;
  }>;
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents a Bitbucket project branching model
 */
export interface BitbucketProjectBranchingModel {
  type: "project_branching_model";
  development: {
    name: string;
    use_mainbranch: boolean;
  };
  production?: {
    name: string;
    use_mainbranch: boolean;
  };
  branch_types: Array<{
    kind: string;
    prefix: string;
  }>;
  links: Record<string, BitbucketLink[]>;
}

/**
 * Represents the configuration for a Bitbucket client
 */
export interface BitbucketConfig {
  baseUrl: string;
  token?: string;
  username?: string;
  password?: string;
  defaultWorkspace?: string;
  allowDangerousCommands?: boolean;
}

/**
 * Represents a pipeline target
 */
export interface BitbucketPipelineTarget {
  type: string;
  ref_type?: string;
  ref_name?: string;
  commit?: {
    type: "commit";
    hash: string;
  };
  selector?: {
    type: string;
    pattern: string;
  };
}

/**
 * Represents a pipeline trigger
 */
export interface BitbucketPipelineTrigger {
  type: string;
  name?: string;
}

/**
 * Represents a pipeline state
 */
export interface BitbucketPipelineState {
  type: string;
  name: "PENDING" | "IN_PROGRESS" | "SUCCESSFUL" | "FAILED" | "ERROR" | "STOPPED";
  result?: {
    type: string;
    name: "SUCCESSFUL" | "FAILED" | "ERROR" | "STOPPED";
  };
}

/**
 * Represents a pipeline variable
 */
export interface BitbucketPipelineVariable {
  type: "pipeline_variable";
  key: string;
  value: string;
  secured?: boolean;
}

/**
 * Represents a pipeline configuration source
 */
export interface BitbucketPipelineConfigurationSource {
  source: string;
  uri: string;
}

/**
 * Represents a pipeline command
 */
export interface BitbucketPipelineCommand {
  name?: string;
  command: string;
}

/**
 * Represents a pipeline step
 */
export interface BitbucketPipelineStep {
  uuid: string;
  type: "pipeline_step";
  name?: string;
  started_on?: string;
  completed_on?: string;
  state: BitbucketPipelineState;
  image?: {
    name: string;
    username?: string;
    password?: string;
    email?: string;
  };
  setup_commands?: BitbucketPipelineCommand[];
  script_commands?: BitbucketPipelineCommand[];
}

/**
 * Represents a Bitbucket pipeline
 */
export interface BitbucketPipeline {
  uuid: string;
  type: "pipeline";
  build_number: number;
  creator: BitbucketAccount;
  repository: BitbucketRepository;
  target: BitbucketPipelineTarget;
  trigger: BitbucketPipelineTrigger;
  state: BitbucketPipelineState;
  created_on: string;
  completed_on?: string;
  build_seconds_used?: number;
  variables?: BitbucketPipelineVariable[];
  configuration_sources?: BitbucketPipelineConfigurationSource[];
  links: Record<string, BitbucketLink[]>;
}

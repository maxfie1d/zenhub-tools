import { Issue, IssueContent } from "../zenhub.ts";

export type Input = {
  epicUrl: string;
  config: Config;
  token: string;
  workspaceId: string;
};

export type Output = {
  epic: IssueContent;
  createdIssue: Issue[];
};

export type Config = {
  issues: IssueConfig[];
};

export type IssueConfig = {
  title: string;
  body: string;
  estimate: number;
  labels: string[];
};

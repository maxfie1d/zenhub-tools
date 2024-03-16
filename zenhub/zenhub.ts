import { ZenHubClient } from "./client.ts";
import * as path from "node:path";

export class ZenHub {
  private client: ZenHubClient;
  private workspaceId: string;

  constructor(token: string, workspaceId: string) {
    this.client = new ZenHubClient(token);
    this.workspaceId = workspaceId;
  }

  async fetchZenhubEpic(url: string): Promise<ZenhubEpic> {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const zenhubEpicId = parts[parts.length - 1];

    const res = await this.client.post(
      `
        query Node($id: ID!) {
            node(id: $id) {
                id
                ... on ZenhubEpic {
                  title
                  body
                }
            }
        }
        `,
      {
        id: zenhubEpicId,
      },
    );

    return {
      id: res.data.node.id,
      content: {
        title: res.data.node.title,
        body: res.data.node.body,
        number: 0,
        url: url,
      },
    };
  }

  async fetchWorkspace(): Promise<ZenhubWorkspace> {
    const res = await this.client.post(
      `
    query ($workspaceId: ID!) {
      workspace(id: $workspaceId) {
        repositoriesConnection {
          nodes {
            name
            id
          }
        }
      }
    }
    `,
      {
        workspaceId: this.workspaceId,
      },
    );

    return {
      repositoryId: res.data.workspace.repositoriesConnection.nodes[0].id,
    };
  }

  async createIssue(
    workspace: ZenhubWorkspace,
    input: CreateIssueInput,
  ): Promise<Issue> {
    // Issueを作る
    // workspace id は知っているものとする
    // まずworkspaceを取得してrepository idを取得する必要がある
    const res = await this.client.post(
      `
    mutation CreateIssue($input: CreateIssueInput!) {
      createIssue(input: $input) {
          clientMutationId
          issue {
            id
            htmlUrl
            title
            body
            number
            estimate {
                value
            }
          }
      }
  }
    `,
      {
        input: {
          repositoryId: workspace.repositoryId,
          title: input.title,
          body: input.body,
          labels: input.labels
        },
      },
    );

    return {
      id: res.data.createIssue.issue.id,
      content: {
        title: res.data.createIssue.issue.title,
        body: res.data.createIssue.issue.body,
        number: res.data.createIssue.issue.number,
        url: res.data.createIssue.issue.htmlUrl,
      },
      estimate: res.data.createIssue.issue.estimate?.value ?? 0,
    };
  }

  async setEstimate(issueId: string, estimate: number) {
    const res = await this.client.post(`
    mutation SetEstimate($input: SetEstimateInput!) {
      setEstimate(input: $input) {
          issue {
              estimate {
                  value
              }
          }
      }
  }
    `, {
      input: {
        issueId,
        value: estimate
      }
    })

  }

  async addIssueToZenhubEpic(issueId: string, zenhubEpicId: string) {
    const res = await this.client.post(`
    mutation AddIssuesToZenhubEpics($input: AddIssuesToZenhubEpicsInput!) {
      addIssuesToZenhubEpics(input: $input) {
          clientMutationId
      }
  }
    `, {
      input: {
        issueIds: [issueId],
        zenhubEpicIds: [zenhubEpicId]
      }
    })
  }
}

export type CreateIssueInput = {
  title: string;
  body: string;
  labels: string[];
};

export type Issue = {
  id: string;
  content: IssueContent;
  estimate: number;
};

export type ZenhubEpic = {
  id: string;
  content: IssueContent;
};

export type ZenhubWorkspace = {
  repositoryId: string;
};

export type GithubEpic = {
  id: string;
  content: IssueContent;
};

export type IssueContent = {
  title: string;
  body: string;
  url: string;
  number: number;
};

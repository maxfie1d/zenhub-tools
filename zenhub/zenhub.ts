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

  async fetchGithubEpic(
    workspace: ZenhubWorkspace,
    url: string,
  ): Promise<GithubEpic> {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const issueNumber = parts[parts.length - 1];

    console.log(issueNumber);
    console.log(workspace.repositoryId);

    const res = await this.client.post(
      `
      query ($repositoryId: ID, $issueNumber: Int!) {
        issueByInfo(
            repositoryId: $repositoryId
            issueNumber: $issueNumber
        ) {
            id
            title
            body
            htmlUrl
            number
            epic {
              id
            }
        }
      }
        `,
      {
        repositoryId: workspace.repositoryId,
        issueNumber: parseInt(issueNumber),
      },
    );

    console.log(res);

    return {
      id: res.data.issueByInfo.epic.id,
      content: {
        title: res.data.issueByInfo.title,
        body: res.data.issueByInfo.body,
        number: res.data.issueByInfo.number,
        url: res.data.issueByInfo.htmlUrl,
      },
    };
  }

  async fetchWorkspace(): Promise<ZenhubWorkspace> {
    const res = await this.client.post(
      `
    query ($workspaceId: ID!) {
      workspace(id: $workspaceId) {
        id
        displayName
        pipelines {
            id
            name
        }
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

    const workspace = res.data.workspace;
    return {
      id: workspace.id,
      displayName: workspace.displayName,
      pipelines: workspace.pipelines as ZenhubPipeline[],
      repositoryId: workspace.repositoriesConnection.nodes[0].id,
    };
  }

  async createIssue(
    workspace: ZenhubWorkspace,
    input: CreateIssueInput,
  ): Promise<Issue> {
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
          labels: input.labels,
        },
      },
    );

    console.log(res);

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
    const res = await this.client.post(
      `
    mutation SetEstimate($input: SetEstimateInput!) {
      setEstimate(input: $input) {
          issue {
              estimate {
                  value
              }
          }
      }
  }
    `,
      {
        input: {
          issueId,
          value: estimate,
        },
      },
    );
  }

  async addIssueToZenhubEpic(issueId: string, zenhubEpicId: string) {
    const res = await this.client.post(
      `
    mutation AddIssuesToZenhubEpics($input: AddIssuesToZenhubEpicsInput!) {
      addIssuesToZenhubEpics(input: $input) {
          clientMutationId
      }
  }
    `,
      {
        input: {
          issueIds: [issueId],
          zenhubEpicIds: [zenhubEpicId],
        },
      },
    );
  }

  async addIssueToGithubEpic(issueId: string, githubEpicId: string) {
    const res = await this.client.post(
      `
      mutation AddIssuesToEpics($input: AddIssuesToEpicsInput!) {
        addIssuesToEpics(input: $input) {
            clientMutationId
        }
      }
    `,
      {
        input: {
          issueIds: [issueId],
          epicIds: [githubEpicId],
        },
      },
    );

    console.log(res);
  }

  async searchIssuesByPipeline(
    pipelineId: string,
  ): Promise<SearchIssuesByPipelineResult> {
    const res = await this.client.post(
      `query SearchIssuesByPipeline($pipelineId: ID!) {
    searchIssuesByPipeline(pipelineId: $pipelineId, filters: {}) {
        sumEstimates
        totalCount
    }
  }
`,
      {
        pipelineId,
      },
    );

    return {
      sumEstimates: res.data.searchIssuesByPipeline.sumEstimates,
      totalCount: res.data.searchIssuesByPipeline.totalCount,
    };
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
  id: string;
  displayName: string;
  pipelines: ZenhubPipeline[];
  repositoryId: string;
};

export type ZenhubPipeline = {
  id: string;
  name: string;
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

type SearchIssuesByPipelineResult = {
  sumEstimates: number;
  totalCount: number;
};

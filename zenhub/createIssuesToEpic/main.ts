import { Input, Output } from "./input.ts";
import { ZenHub } from "../zenhub.ts";

const zenhubHost = "app.zenhub.com";
const githubHost = "github.com";

export async function main(input: Input): Promise<Output> {
  const zenhub = new ZenHub(input.token, input.workspaceId);
  const workspace = await zenhub.fetchWorkspace();

  const isGithubEpic = new URL(input.epicUrl).hostname == githubHost;

  const epic = isGithubEpic
    ? await zenhub.fetchGithubEpic(workspace, input.epicUrl)
    : await zenhub.fetchZenhubEpic(input.epicUrl);

  const issues = await Promise.all(
    input.config.issues.map(async (issueConfig) => {
      const variables: VariableReplacement[] = [
        { key: "{EPIC_TITLE}", value: epic.content.title },
        { key: "{EPIC_BODY}", value: epic.content.body },
        { key: "{EPIC_NUMBER}", value: epic.content.number.toString() },
      ];
      const issue = await zenhub.createIssue(
        workspace,
        {
          title: embedVariable(issueConfig.title, variables),
          body: embedVariable(issueConfig.body, variables),
          labels: issueConfig.labels,
        },
      );
      await zenhub.setEstimate(issue.id, issueConfig.estimate);

      if (isGithubEpic) {
        await zenhub.addIssueToGithubEpic(issue.id, epic.id);
      } else {
        await zenhub.addIssueToZenhubEpic(issue.id, epic.id);
      }
      return issue;
    }),
  );

  return {
    epic: epic.content,
    createdIssue: issues,
  };
}

function embedVariable(
  pattern: string,
  variables: VariableReplacement[],
): string {
  var r = pattern;
  for (const variable of variables) {
    r = r.replace(variable.key, variable.value);
  }
  return r;
}

type VariableReplacement = {
  key: string;
  value: string;
};

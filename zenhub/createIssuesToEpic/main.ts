import { Input, Output } from "./input.ts";
import { ZenHub } from "../zenhub.ts";

export async function main(input: Input): Promise<Output> {
  const zenhub = new ZenHub(input.token, input.workspaceId);

  // url のhostを見て使うapiを分ける必要がある
  // github actions から呼び出すようにする

  // ここ
  const epic = await zenhub.fetchZenhubEpic(input.epicUrl);
  const workspace = await zenhub.fetchWorkspace();

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

      // ここ
      await zenhub.addIssueToZenhubEpic(issue.id, epic.id);
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

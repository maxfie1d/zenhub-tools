import { parseArgs } from "https://deno.land/std@0.207.0/cli/parse_args.ts";
import { Input, Output } from "./input.ts";
import { main } from "./main.ts";
import { joinToString } from "https://deno.land/std@0.220.1/collections/mod.ts";

import { load } from "https://deno.land/std@0.220.0/dotenv/mod.ts";

const env = await load();

const flags = parseArgs(Deno.args, {
  string: ["config", "epic-url", "token", "workspace-id"],
});

const configPath = flags.config;
const epicUrl = flags["epic-url"];
const token = flags.token ?? env["ZENHUB_API_TOKEN"] ?? Deno.env.get("ZENHUB_API_TOKEN");
const workspaceId = flags["workspace-id"] ?? env["ZENHUB_WORKSPACE_ID"] ?? Deno.env.get("ZENHUB_WORKSPACE_ID"); 

if (!configPath) throw "config undefined";
if (!epicUrl) throw "epicUrl undefined";
if (!token) throw "zenhub api token undefined";
if (!workspaceId) throw "workspace id undefined";

const configContent = await Deno.readTextFile(configPath);

const input: Input = {
  epicUrl,
  config: JSON.parse(configContent),
  token: token,
  workspaceId: workspaceId,
};

const result = await main(input);

console.log(composeResult(result));

function composeResult(result: Output): string {
  const headline = `${result.createdIssue.length} issues created.`;
  const issues = joinToString(
    result.createdIssue,
    (issue) => `* #${issue.content.number} ${issue.content.title}`,
    { separator: "\n" },
  );
  return `${headline}

${issues}
`;
}

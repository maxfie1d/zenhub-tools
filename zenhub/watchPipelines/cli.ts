import "https://deno.land/std@0.207.0/dotenv/load.ts";
import * as core from "npm:@actions/core@1.10.1";
import { main } from "./main.ts";
import { parseArgs } from "https://deno.land/std@0.207.0/cli/parse_args.ts";

const zenhubApiToken = Deno.env.get("ZENHUB_API_TOKEN") ?? "";
const workspaceId = Deno.env.get("ZENHUB_WORKSPACE_ID") ?? "";

const flags = parseArgs(Deno.args, {
  string: ["out"],
});

const output = await main({ token: zenhubApiToken, workspaceId: workspaceId });

const out = flags.out
if (out) {
  await Deno.writeTextFile(out, JSON.stringify(output, null, 2));
}

console.log(output.pipelineStats);

if (false) {
// Generate summary
core.summary.addHeading("ZenHub Pipelines Summary");

const headerRow = [
  { header: true, data: "Pipeline" },
  { header: true, data: "Total Issues" },
  { header: true, data: "Total Estimates" },
];
const restRows = output.pipelineStats.map(
  (stat) => [
    stat.pipeline,
    stat.totalCount.toString(),
    stat.sumEstimates.toString(),
  ],
);
core.summary.addTable([
  headerRow,
  ...restRows,
]);

core.summary.write();

}
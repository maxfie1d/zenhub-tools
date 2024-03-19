import { ZenHub } from "../zenhub.ts";
import { Input } from "./input.ts";
import { Output } from "./input.ts";

export async function main(input: Input): Promise<Output> {
  const zenhub = new ZenHub(input.token, input.workspaceId);
  const workspace = await zenhub.fetchWorkspace();

  const pipelineStats = await Promise.all(
    workspace.pipelines.map(async (pipeline) => {
      const result = await zenhub.searchIssuesByPipeline(pipeline.id);
      return {
        pipeline: pipeline.name,
        totalCount: result.totalCount,
        sumEstimates: result.sumEstimates,
      };
    }),
  );

  return { pipelineStats: pipelineStats };
}

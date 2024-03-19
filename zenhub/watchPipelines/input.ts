export type Input = {
  token: string;
  workspaceId: string;
};

export type Output = {
  pipelineStats: PipelineStat[];
};

export type PipelineStat = {
  pipeline: string;
  totalCount: number;
  sumEstimates: number;
};

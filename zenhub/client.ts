import ky from "https://esm.sh/ky@1.2.0?dts";

export class ZenHubClient {
  private static endpoint = "https://api.zenhub.com/public/graphql";
  constructor(
    private token: string,
    private endpoint = ZenHubClient.endpoint,
  ) {
  }
  async post(query: string, variables: any = {}): Promise<any> {
    return await ky.post(this.endpoint, {
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      json: {
        query: query,
        variables: variables,
      },
    }).json<any>();
  }
}

deno run --allow-all zenhub/createIssuesToEpic/cli.ts \
--epic-url "https://app.zenhub.com/workspaces/engineering-team-65f4e509559182013efc0fa2/epics/Z2lkOi8vcmFwdG9yL1plbmh1YkVwaWMvMTg0ODM5?state=OPEN&state=TODO&state=IN_PROGRESS" \
--config zenhub/createIssuesToEpic/config.json \
--output-slack-block slack.out.json
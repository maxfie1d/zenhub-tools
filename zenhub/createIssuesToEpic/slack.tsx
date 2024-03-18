/** @jsxImportSource npm:jsx-slack@6 */
import { Blocks, Divider, Field, Header, Section } from "npm:jsx-slack@6";
import { Output } from "./input.ts";

export const buildBlocks = (output: Output) => (
  <Blocks>
    <Header>
      {output.createdIssue.length} issue(s) created!
    </Header>
    <Section>
        Epic: <a href={output.epic.url}>{output.epic.title} #{output.epic.number??""}</a>
    </Section>
    {output.createdIssue.map((issue) => (
      <Section>
        <Field>
          <b>Issue</b>
          <br />
          <a href={issue.content.url}>
              {issue.content.title} #{issue.content.number}
            </a>
        </Field>
        <Field>
          <b>Estimate</b>
          <br />
          {issue.estimate ?? "none"}
        </Field>
      </Section>
    ))}
  </Blocks>
);

const output: Output = {
  epic: {
    title: "epic title",
    body: "body",
    url: "https://google.com/epic",
    number: 123,
  },
  createdIssue: [
    {
      id: "id",
      estimate: 3,
      content: {
        title: "[Android] title 1",
        body: "body",
        url: "https://google.com",
        number: 123,
      },
    },
    {
      id: "id",
      estimate: 3,
      content: {
        title: "[iOS] title 2",
        body: "body",
        url: "https://google.com",
        number: 124,
      },
    },
  ],
};
console.log(
  JSON.stringify(
    {
      blocks: buildBlocks(output),
    },
    null,
    2,
  ),
);

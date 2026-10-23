import { OutgoingLink } from "../OutgoingLink";
import { renderWithIntl } from "../../../__tests__/environment/Environment";

describe("OutgoingLink", () => {
  it("OutgoingLink shows the link symbol by default", () => {
    const { container } = renderWithIntl(
      <OutgoingLink label="label" iri="http://link.me/link" />
    );
    expect(
      container.querySelector("i.fas.fa-external-link-alt")
    ).toBeInTheDocument();
    expect(container.querySelector("span.hidden")).not.toBeInTheDocument();
  });
  it("OutgoingLink does not show the link symbol for showLink=false", () => {
    const { container } = renderWithIntl(
      <OutgoingLink label="label" iri="http://link.me/link" showLink={false} />
    );
    expect(container.querySelector("span.hidden")).toBeInTheDocument();
  });
});

import * as React from "react";
import FTSMatch from "../FTSMatch";
import { mountWithIntl } from "../../../../__tests__/environment/Environment";
import { intlFunctions } from "../../../../__tests__/environment/IntlUtil";

describe("FTSMatch", () => {
  it("renders match as element with highlighting class and match content", () => {
    const snippet = "<em>Match</em> text";
    const wrapper = mountWithIntl(
      <FTSMatch match={snippet} {...intlFunctions()} />
    );
    const elem = wrapper.find(".search-result-snippet-match");
    expect(elem.length).toEqual(1);
    expect(elem.text()).toEqual("Match");
  });

  it("renders multiple matches as elements with highlighting class", () => {
    const snippet = "<em>Match</em> text and another <em>match</em> here";
    const wrapper = mountWithIntl(
      <FTSMatch match={snippet} {...intlFunctions()} />
    );
    const elem = wrapper.find(".search-result-snippet-match");
    expect(elem.length).toEqual(2);
  });
});

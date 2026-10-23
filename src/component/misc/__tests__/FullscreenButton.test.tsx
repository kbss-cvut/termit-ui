import { FullscreenButton } from "../FullscreenButton";
import { renderWithIntl } from "../../../__tests__/environment/Environment";
import { i18n } from "../../../__tests__/environment/IntlUtil";
import { screen } from "@testing-library/react";

describe("Button Fullscreen", () => {
  it("button in fullscreen", () => {
    const toggleFullScreen = vi.fn();
    renderWithIntl(
      <FullscreenButton
        toggleFullscreen={toggleFullScreen}
        isFullscreen={true}
      />
    );
    expect(screen.getByTitle(i18n("fullscreen.exit"))).toBeInTheDocument();
  });
  it("button in window", () => {
    const toggleFullScreen = vi.fn();
    renderWithIntl(
      <FullscreenButton
        toggleFullscreen={toggleFullScreen}
        isFullscreen={false}
      />
    );
    expect(screen.getByTitle(i18n("fullscreen.enter"))).toBeInTheDocument();
  });
});

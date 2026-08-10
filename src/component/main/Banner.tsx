import { getEnv } from "../../util/Constants";
import { Badge, Nav } from "reactstrap";

export const Banner = () => {
  const bannerText = getEnv("BANNER", "");
  if (bannerText.trim().length === 0) {
    return null;
  }
  const bannerTooltip = getEnv("BANNER_TOOLTIP", "");
  return (
    <Nav id="navbar-banner" title={bannerTooltip}>
      <h1>
        <Badge color="info">{bannerText}</Badge>
      </h1>
    </Nav>
  );
};

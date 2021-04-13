import * as React from "react";
import Footer from "../footer/Footer";
import { Container } from "reactstrap";
import Constants from "../../util/Constants";

interface PublicLayoutProps {
  className?: string;
  title: string;
  children: React.ReactNode;
}

const PublicLayout: React.FC<PublicLayoutProps> = (props) => {
  return (
    <div
      className="main-container"
      style={{
        backgroundImage: `url(${Constants.LAYOUT_WALLPAPER})`,
        backgroundPosition: "center",
      }}
    >
      <Container
        fluid={true}
        className="pt-3 flex-grow-1 main-container align-items-center justify-content-center"
      >
        {props.children}
      </Container>
      <Footer
        transparent={true}
        authenticated={false}
        sidebarExpanded={false}
      />
    </div>
  );
};

export default PublicLayout;

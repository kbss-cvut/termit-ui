import * as React from "react";
import { Card, CardBody, Col } from "reactstrap";
import ResourceList from "./ResourceList";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import { useI18n } from "../hook/useI18n";

const ResourceManagement: React.FC = () => {
  const { i18n } = useI18n();

  return (
    <>
      <WindowTitle title={i18n("main.nav.resources")} />
      <HeaderWithActions title={i18n("resource.management")} />
      <div className="row">
        <Col md={12}>
          <Card>
            <CardBody>
              <ResourceList />
            </CardBody>
          </Card>
        </Col>
      </div>
    </>
  );
};

export default ResourceManagement;

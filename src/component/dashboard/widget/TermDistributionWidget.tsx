import React from "react";
import { useI18n } from "../../hook/useI18n";
import { Card, CardBody, CardHeader } from "reactstrap";
import TermDistribution from "../../statistics/termfrequency/TermDistribution";

const TermDistributionWidget: React.FC = () => {
  const { i18n } = useI18n();

  return (
    <Card className="h-100">
      <CardHeader tag="h4" color="primary">
        {i18n("dashboard.widget.typeFrequency.title")}
      </CardHeader>
      <CardBody className="p-1">
        <TermDistribution />
      </CardBody>
    </Card>
  );
};

export default TermDistributionWidget;

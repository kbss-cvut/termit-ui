import React from "react";
import { useI18n } from "../../hook/useI18n";
import { Card, CardBody, CardHeader } from "reactstrap";
import TermFrequency from "../../statistics/termfrequency/TermFrequency";
import raw from "raw.macro";

const TermFrequencyWidget: React.FC = () => {
  const { i18n, locale } = useI18n();

  return (
    <Card className="h-100">
      <CardHeader tag="h4" color="primary">
        {i18n("dashboard.widget.typeFrequency.title")}
      </CardHeader>
      <CardBody className="p-1">
        <TermFrequency
          sparqlQuery={raw("../../statistics/termfrequency/TermFrequency.rq")}
          lang={locale}
        />
      </CardBody>
    </Card>
  );
};

export default TermFrequencyWidget;

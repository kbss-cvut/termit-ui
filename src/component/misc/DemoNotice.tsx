import React from "react";
import { FormattedMessage } from "react-intl";
import { Alert } from "reactstrap";
import { FaInfoCircle } from "react-icons/fa";

const DemoNotice: React.FC = () => {
  return (
    <Alert color="info">
      <FaInfoCircle className="mr-1 mb-1" />
      <FormattedMessage
        id="demo.notice"
        values={{
          b: (chunks: any) => <b>{chunks}</b>,
        }}
      />
    </Alert>
  );
};

export default DemoNotice;

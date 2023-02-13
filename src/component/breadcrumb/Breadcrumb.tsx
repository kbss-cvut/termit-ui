import React, { useEffect, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import { addCrumb, removeCrumb } from "../../action/SyncActions";
import { Breadcrumb as BreadcrumItem } from "../../model/Breadcrumb";

interface BreadcrumbProps {
  data: BreadcrumItem;
  hidden?: boolean;
}

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  data,
  children,
  hidden = false,
}) => {
  const dispatch: ThunkDispatch = useDispatch();
  const [id] = useState(uuidv4());

  useEffect(() => {
    if (hidden) {
      dispatch(removeCrumb({ ...data, id }));
    } else {
      dispatch(addCrumb({ ...data, id }));
    }
    return () => {
      dispatch(removeCrumb({ ...data, id }));
    };
  }, [data, hidden, dispatch, id]);

  return <>{children}</>;
};

export default Breadcrumb;

import React from "react";
import { usePromiseTracker } from "react-promise-tracker";
import Mask from "./Mask";
import ContainerMask from "./ContainerMask";

interface PromiseTrackingMaskProps {
  area: string;
  text?: string;
  coverViewport?: boolean;
}

const PromiseTrackingMask: React.FC<PromiseTrackingMaskProps> = ({
  area,
  text,
  coverViewport,
}) => {
  const { promiseInProgress } = usePromiseTracker({ area });

  return (
    <>
      {promiseInProgress &&
        (area && !coverViewport ? (
          <ContainerMask text={text} />
        ) : (
          <Mask text={text} />
        ))}
    </>
  );
};

PromiseTrackingMask.defaultProps = {
  coverViewport: false,
};

export default PromiseTrackingMask;

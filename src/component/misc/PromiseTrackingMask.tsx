import React from "react";
import { usePromiseTracker } from "react-promise-tracker";
import Mask from "./Mask";
import ContainerMask from "./ContainerMask";

interface PromiseTrackingMaskProps {
  area: string;
  text?: string;
  coverViewport?: boolean;
  withoutText?: boolean;
}

const PromiseTrackingMask: React.FC<PromiseTrackingMaskProps> = ({
  area,
  text,
  coverViewport = false,
  withoutText,
}) => {
  const { promiseInProgress } = usePromiseTracker({ area });

  return (
    <>
      {promiseInProgress &&
        (area && !coverViewport ? (
          <ContainerMask text={text} withoutText={withoutText} />
        ) : (
          <Mask text={text} withoutText={withoutText} />
        ))}
    </>
  );
};

export default PromiseTrackingMask;

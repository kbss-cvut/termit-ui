declare module "react-fullscreenable" {
  interface FullscreenableProps {
    toggleFullscreen: () => {};
    isFullscreen: boolean;
  }

  export default function Fullscreenable<P>(): (
    c: React.ComponentType<P & FullscreenableProps>
  ) => React.ComponentType<
    Pick<P, Exclude<keyof P, keyof FullscreenableProps>>
  >;
}

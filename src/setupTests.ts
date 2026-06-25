import { TextDecoder, TextEncoder } from "util";
import "vitest-localstorage-mock";
import { configure } from "enzyme";
import Adapter from "@wojtekmaj/enzyme-adapter-react-17";
import enableHooks from "vitest-react-hooks-shallow";

configure({ adapter: new Adapter() });

// Polyfill for encoding which isn't present globally in jsdom, taken from Node
// This is a jsdom issue: https://github.com/jsdom/jsdom/issues/2524
(global as any).TextDecoder = TextDecoder;
(global as any).TextEncoder = TextEncoder;

// Polyfill for document.createRange which is needed by some tests
// https://github.com/mui-org/material-ui/issues/15726
// This is fixed in jest 26, but react scripts v4 are needed for that
(global as any).document.createRange = () => ({
  setStart: () => {},
  setEnd: () => {},
  commonAncestorContainer: {
    nodeName: "BODY",
    ownerDocument: document,
  },
});

enableHooks(vi, { dontMockByDefault: true });

import.meta.env.VITE_VERSION = "0.0.1";
import.meta.env.VITE_SERVER_URL = "http://localhost:8080/termit";
import.meta.env.VITE_DEPLOYMENT_NAME = "";
import.meta.env.VITE_AUTHENTICATION = "";

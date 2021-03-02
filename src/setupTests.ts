import { TextDecoder } from 'util'
import "jest-localstorage-mock";
import {configure} from "enzyme";
import Adapter from "enzyme-adapter-react-16";

configure({ adapter: new Adapter() });

// Polyfill for encoding which isn't present globally in jsdom, taken from Node
// This is a jsdom issue: https://github.com/jsdom/jsdom/issues/2524
(global as any).TextDecoder = TextDecoder;

// Polyfill for document.createRange which is needed by some tests
// https://github.com/mui-org/material-ui/issues/15726
// This is fixed in jest 26, but react scripts v4 are needed for that
(global as any).document.createRange = () => ({
    setStart: () => {},
    setEnd: () => {},
    commonAncestorContainer: {
        nodeName: 'BODY',
        ownerDocument: document,
    },
});

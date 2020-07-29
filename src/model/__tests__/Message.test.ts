import Message from "../Message";
import MessageType from "../MessageType";

describe("Message", () => {

    it("sets timestamp to current time in millis in constructor", () => {
        const sut = new Message({messageId: "save"}, MessageType.SUCCESS);
        expect(sut.timestamp).toBeDefined();
        expect(Date.now() - sut.timestamp).toBeGreaterThanOrEqual(0);
    });
});

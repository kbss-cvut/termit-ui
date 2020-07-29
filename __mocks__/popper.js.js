import PopperJs from 'popper.js';

/**
 * Prevents 'document.createRange is not a function' exceptions when testing reactstrap Popover or Tooltip-based components, which internally use popper.js.
 * See https://github.com/FezVrasta/popper.js/issues/478
 */
export default class Popper {
    static placements = PopperJs.placements;

    constructor() {
        return {
            destroy: () => {},
            scheduleUpdate: () => {}
        };
    }
}
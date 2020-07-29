/**
 * Returns the display name of the specified component (if defined).
 * @param Component
 * @return {*|string}
 */
import * as React from "react";

export default (Component: React.ComponentType<any>) => {
    return Component.displayName || Component.name || "Component"
};

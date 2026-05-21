enum AccessLevel {
  NONE = "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/none",
  READ = "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/read",
  WRITE = "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/write",
  SECURITY = "http://onto.fel.cvut.cz/ontologies/application/termit/access-level/security",
}

/**
 * Checks if the required access level is satisfied by the current user's actual access level.
 *
 * This check is hierarchical, so if the user has higher access level than required, this method returns true.
 * @param required Required level of access to a resource/feature
 * @param actual Actual level of access of the current user
 */
export function hasAccess(
  required: AccessLevel,
  actual: string | AccessLevel = AccessLevel.NONE
) {
  switch (required) {
    case AccessLevel.NONE:
      return true;
    case AccessLevel.READ:
      return (
        actual === AccessLevel.READ ||
        actual === AccessLevel.WRITE ||
        actual === AccessLevel.SECURITY
      );
    case AccessLevel.WRITE:
      return actual === AccessLevel.WRITE || actual === AccessLevel.SECURITY;
    case AccessLevel.SECURITY:
      return actual === AccessLevel.SECURITY;
    default:
      return false;
  }
}

export function strToAccessLevel(str: string) {
  if (Object.values(AccessLevel).some((col: string) => col === str)) {
    return str as AccessLevel;
  }
  throw new TypeError(`Unsupported AccessLevel constant '${str}'.`);
}

export default AccessLevel;

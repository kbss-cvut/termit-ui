enum AccessLevel {
  NONE = "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/\u017e\u00e1dn\u00e1",
  READ = "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/\u010dten\u00ed",
  WRITE = "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/z\u00e1pis",
  SECURITY = "http://onto.fel.cvut.cz/ontologies/application/termit/pojem/\u00farove\u0148-p\u0159\u00edstupov\u00fdch-opr\u00e1vn\u011bn\u00ed/spr\u00e1va",
}

/**
 * Checks if the required access level is satisfied by the current user's actual access level.
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

export default AccessLevel;

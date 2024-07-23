import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
  uri: "@id",
  token: VocabularyUtils.DC_IDENTIFIER,
  newPassword: VocabularyUtils.HAS_PASSWORD,
};

/**
 * DTO used for submitting password change with password reset token
 */
export default class ChangePasswordDto {
  public uri: string;
  public token: string;
  public newPassword: string;

  constructor(uri: string, token: string, newPassword: string) {
    this.uri = uri;
    this.token = token;
    this.newPassword = newPassword;
  }

  public toJsonLd() {
    return Object.assign({}, this, {
      "@context": CONTEXT,
      "@type":
        "http://onto.fel.cvut.cz/ontologies/application/termit/password-change",
    });
  }
}

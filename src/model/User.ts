import Utils from "../util/Utils";
import VocabularyUtils from "../util/VocabularyUtils";

export const CONTEXT = {
  iri: "@id",
  firstName: VocabularyUtils.PREFIX + "má-křestní-jméno",
  lastName: VocabularyUtils.PREFIX + "má-příjmení",
  username: VocabularyUtils.PREFIX + "má-uživatelské-jméno",
  password: VocabularyUtils.PREFIX + "má-heslo",
  originalPassword:
    "http://onto.fel.cvut.cz/ontologies/application/termit/original-password",
  lastSeen: "http://rdfs.org/sioc/ns#last_activity_date",
  types: "@type",
};

export interface UserAccountData {
  firstName: string;
  lastName: string;
  username: string;
  password: string;
}

export interface UserData {
  iri: string;
  firstName: string;
  lastName: string;
  username: string;
  types?: string[];
  lastSeen?: string;
}

export interface UserDataWithPassword extends UserData {
  password: string;
  originalPassword: string;
}

/**
 * System user account.
 */
export default class User implements UserData {
  public readonly iri: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly username: string;
  public readonly types: string[];
  protected readonly password?: string;
  protected readonly originalPassword?: string;
  public readonly lastSeen?: string;

  constructor(data: UserData | UserDataWithPassword) {
    this.iri = data.iri;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.username = data.username;
    this.lastSeen = data.lastSeen;
    this.types = Utils.sanitizeArray(data.types);
  }

  get fullName(): string {
    return this.firstName + " " + this.lastName;
  }

  get abbreviatedName(): string {
    return this.firstName.charAt(0).toUpperCase() + ". " + this.lastName;
  }

  public isDisabled(): boolean {
    return this.types.indexOf(VocabularyUtils.USER_DISABLED) !== -1;
  }

  public isLocked(): boolean {
    return this.types.indexOf(VocabularyUtils.USER_LOCKED) !== -1;
  }

  /**
   * Indicates that the user is neither locked nor disabled and thus can log into the system.
   */
  public isActive(): boolean {
    return !this.isDisabled() && !this.isLocked();
  }

  public isAdmin(): boolean {
    return this.types.indexOf(VocabularyUtils.USER_ADMIN) !== -1;
  }

  public toJsonLd(): UserData {
    return Object.assign({}, this, { "@context": CONTEXT });
  }
}

export class PasswordUpdateUser extends User implements UserDataWithPassword {
  public readonly password: string;
  public readonly originalPassword: string;

  public constructor(data: UserDataWithPassword) {
    super(data);
    this.password = data.password;
    this.originalPassword = data.originalPassword;
  }
}

export const EMPTY_USER = new User({
  iri: "http://empty",
  firstName: "",
  lastName: "",
  username: "",
});

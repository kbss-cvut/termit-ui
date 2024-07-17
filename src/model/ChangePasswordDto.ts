/**
 * DTO used for submitting password change with password reset token
 */
export default interface ChangePasswordDto {
  uri: string;
  token: string;
  newPassword: string;
}

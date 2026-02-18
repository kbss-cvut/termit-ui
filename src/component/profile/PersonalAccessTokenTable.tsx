import { Button, Table } from "reactstrap";
import { useI18n } from "../hook/useI18n";
import { PersonalAccessToken } from "../../model/PersonalAccessToken";
import Utils from "../../util/Utils";
import { FormattedDate, FormattedTime } from "react-intl";
import If from "../misc/If";

interface PersonalAccessTokenTableProps {
  tokens?: PersonalAccessToken[];
  deleteToken?: (token: PersonalAccessToken) => void;
}

const PersonalAccessTokenTable: React.FC<PersonalAccessTokenTableProps> = ({
  tokens,
  deleteToken,
}) => {
  const { i18n } = useI18n();
  return (
    <Table>
      <thead>
        <tr>
          <td>{i18n("profile.pat.created")}</td>
          <td>{i18n("profile.pat.lastUsed")}</td>
          <td>{i18n("profile.pat.expiration")}</td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        {tokens?.map((token: PersonalAccessToken) => (
          <tr key={"personalAccessToken-" + Utils.hashCode(token.iri)}>
            <td>
              <FormattedDate value={token.created} />{" "}
              <FormattedTime value={token.created} />
            </td>
            <td>
              <If expression={Utils.notBlank(token.lastUsed)}>
                <FormattedDate value={token.lastUsed} />{" "}
                <FormattedTime value={token.lastUsed} />
              </If>
            </td>
            <td>
              <If expression={!token.expirationDate}>
                {"\u221e" /* infinity symbol */}
              </If>
              <If expression={!!token.expirationDate}>
                <FormattedDate value={token.expirationDate} />
              </If>
            </td>
            <td>
              <If expression={!!deleteToken}>
                <Button
                  size="sm"
                  color="danger"
                  title={i18n("profile.pat.action.remove.title")}
                  onClick={() => deleteToken!(token)}
                >
                  {i18n("remove")}
                </Button>
              </If>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default PersonalAccessTokenTable;

import User from "../../model/User";
import * as React from "react";
import { useEffect, useState } from "react";
import { useI18n } from "../hook/useI18n";
import { Button, Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { PersonalAccessToken } from "../../model/PersonalAccessToken";
import If from "../misc/If";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import { trackPromise } from "react-promise-tracker";
import { loadPersonalAccessTokens } from "../../action/AsyncUserActions";
import { ThunkDispatch } from "../../util/Types";
import { useDispatch } from "react-redux";
import "./PersonalAccessTokensList.scss";
import PersonalAccessTokenCreationResultDialog from "./PersonalAccessTokenCreationResultDialog";
import PersonalAccessTokenCreationDialog from "./PersonalAccessTokenCreationDialog";
import PersonalAccessTokenTable from "./PersonalAccessTokenTable";
import PersonalAccessTokenDeletionDialog from "./PersonalAccessTokenDeletionDialog";

interface PersonalAccessTokensListProps {
  user: User;
}

const PERSONAL_ACCESS_TOKENS_PROMISE_AREA =
  "PERSONAL_ACCESS_TOKENS_PROMISE_AREA";

const PersonalAccessTokensList: React.FC<PersonalAccessTokensListProps> = ({
  user,
}) => {
  const { i18n } = useI18n();
  const [tokens, setTokens] = useState<PersonalAccessToken[]>();
  const [refreshSignalValue, setRefreshSignalValue] = useState(false);
  const [isCreationDialogOpen, setIsCreationDialogOpen] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [tokenToDelete, setTokenToDelete] =
    useState<PersonalAccessToken | null>(null);
  const dispatch: ThunkDispatch = useDispatch();

  useEffect(() => {
    trackPromise(
      dispatch(loadPersonalAccessTokens()),
      PERSONAL_ACCESS_TOKENS_PROMISE_AREA
    ).then((data) => {
      if (data instanceof Array) {
        setTokens(data);
      } else {
        setTokens([]);
      }
    });
  }, [user, refreshSignalValue, dispatch]);

  const doRefresh = () => {
    setRefreshSignalValue(!refreshSignalValue);
  };

  const openCreateDialog = () => {
    setIsCreationDialogOpen(true);
  };

  const closeCreationDialog = () => {
    setIsCreationDialogOpen(false);
  };

  const onTokenCreated = (token: string | null) => {
    setNewTokenValue(token);
    closeCreationDialog();
    doRefresh();
  };

  const showDeleteDialog = (token: PersonalAccessToken) => {
    setTokenToDelete(token);
  };

  const onDeleteDialogClose = () => {
    setTokenToDelete(null);
    doRefresh();
  };

  const tokensPresent = tokens?.length != null && tokens.length > 0;
  return (
    <Card id={"profile-pat-card"}>
      <CardHeader>
        <Row>
          <Col>
            <h2>{i18n("profile.pat.title")}</h2>
          </Col>
          <Col style={{ flexGrow: 0 }}>
            <Button
              size="sm"
              color="primary"
              title={i18n("profile.pat.action.create.title")}
              onClick={openCreateDialog}
            >
              {i18n("create")}
            </Button>
          </Col>
        </Row>
      </CardHeader>
      <CardBody>
        <PromiseTrackingMask area={PERSONAL_ACCESS_TOKENS_PROMISE_AREA} />
        <If expression={!tokensPresent}>{i18n("profile.pat.noTokens")}</If>
        <If expression={tokensPresent}>
          <PersonalAccessTokenTable
            tokens={tokens}
            deleteToken={showDeleteDialog}
          />
        </If>
      </CardBody>
      <PersonalAccessTokenCreationDialog
        isOpen={isCreationDialogOpen}
        onTokenCreated={onTokenCreated}
        onCancel={closeCreationDialog}
      />
      <PersonalAccessTokenCreationResultDialog
        token={newTokenValue}
        onClose={() => setNewTokenValue(null)}
      />
      <PersonalAccessTokenDeletionDialog
        token={tokenToDelete}
        onClose={onDeleteDialogClose}
      />
    </Card>
  );
};

export default PersonalAccessTokensList;
export { PERSONAL_ACCESS_TOKENS_PROMISE_AREA };

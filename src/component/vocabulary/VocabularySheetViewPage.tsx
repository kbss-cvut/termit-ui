import * as React from "react";
import { RouteComponentProps } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { useQueryClient } from "@tanstack/react-query";
import { trackPromise } from "react-promise-tracker";
import { Button, Card, CardBody } from "reactstrap";
import { GoPlus } from "react-icons/go";
import Term from "../../model/Term";
import TermItState from "../../model/TermItState";
import Vocabulary, { EMPTY_VOCABULARY } from "../../model/Vocabulary";
import AppNotification from "../../model/AppNotification";
import NotificationType from "../../model/NotificationType";
import { Configuration } from "../../model/Configuration";
import { useI18n } from "../hook/useI18n";
import { ThunkDispatch } from "../../util/Types";
import Utils from "../../util/Utils";
import VocabularyUtils, { IRI } from "../../util/VocabularyUtils";
import { getLocalized } from "../../model/MultilingualString";
import { getShortLocale } from "../../util/IntlUtil";
import HeaderWithActions from "../misc/HeaderWithActions";
import WindowTitle from "../misc/WindowTitle";
import PromiseTrackingMask from "../misc/PromiseTrackingMask";
import VocabularySheetViewTable from "./VocabularySheetViewTable";
import IncludeImportedTermsToggle from "../term/IncludeImportedTermsToggle";
import Routing, { namespaceQueryParam } from "../../util/Routing";
import Routes from "../../util/Routes";
import IfVocabularyActionAuthorized from "../vocabulary/authorization/IfVocabularyActionAuthorized";
import AccessLevel from "../../model/acl/AccessLevel";
import { loadVocabulary } from "../../action/AsyncActions";
import { consumeNotification } from "../../action/SyncActions";
import ActionType from "../../action/ActionType";
import AsyncActionStatus from "../../action/AsyncActionStatus";

const RELEVANT_ACTION_TYPES = [
  ActionType.CREATE_VOCABULARY_TERM,
  ActionType.IMPORT_VOCABULARY,
];

const isTermAssetLabelUpdate = Utils.generateIsAssetLabelUpdate(
  VocabularyUtils.TERM
);

function isNotificationRelevant(n: AppNotification) {
  return (
    (RELEVANT_ACTION_TYPES.includes(n.source.type) &&
      n.source.status === AsyncActionStatus.SUCCESS) ||
    n.source.type === NotificationType.TERM_HIERARCHY_UPDATED
  );
}

function useRefreshVocabularySheetViewOnNotifications(
  notifications: AppNotification[],
  dispatch: ThunkDispatch
) {
  const queryClient = useQueryClient();

  React.useEffect(() => {
    const matchingNotification = notifications.find(
      (n) => isNotificationRelevant(n) || isTermAssetLabelUpdate(n)
    );
    if (!matchingNotification) {
      return;
    }

    dispatch(consumeNotification(matchingNotification));
    queryClient.invalidateQueries({ queryKey: ["vocabulary-sheet-view"] });
  }, [dispatch, notifications, queryClient]);
}

interface UseLoadVocabularyFromRouteParams {
  matchParams: { name: string; timestamp?: string };
  locationSearch: string;
  configuration: Configuration;
  loadedVocabularyIri: string;
  dispatch: ThunkDispatch;
  trackingArea?: string;
}

function useLoadVocabularyFromRoute({
  matchParams,
  locationSearch,
  configuration,
  loadedVocabularyIri,
  dispatch,
  trackingArea = "vocabulary-sheet-view",
}: UseLoadVocabularyFromRouteParams): IRI {
  const { name, timestamp } = matchParams;

  const vocabularyIri = React.useMemo(
    () =>
      Utils.resolveVocabularyIriFromRoute(
        { name, timestamp },
        locationSearch,
        configuration
      ),
    [configuration, locationSearch, name, timestamp]
  );

  React.useEffect(() => {
    const loadedIri = VocabularyUtils.create(loadedVocabularyIri);

    if (
      loadedIri.fragment !== vocabularyIri.fragment ||
      (vocabularyIri.namespace &&
        loadedIri.namespace !== vocabularyIri.namespace)
    ) {
      trackPromise(dispatch(loadVocabulary(vocabularyIri)), trackingArea);
    }
  }, [dispatch, loadedVocabularyIri, trackingArea, vocabularyIri]);

  return vocabularyIri;
}

const VocabularySheetViewPage: React.FC<RouteComponentProps<any>> = ({
  match,
  location,
}) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();
  const vocabulary = useSelector((state: TermItState) => state.vocabulary);
  const selectedTerm = useSelector((state: TermItState) => state.selectedTerm);
  const configuration = useSelector(
    (state: TermItState) => state.configuration
  );
  const notifications = useSelector(
    (state: TermItState) => state.notifications
  );

  const includeImported =
    Utils.extractQueryParam(location.search, "includeImported") ===
    true.toString();

  const vocabularyIri = useLoadVocabularyFromRoute({
    matchParams: match.params,
    locationSearch: location.search,
    configuration,
    loadedVocabularyIri: vocabulary.iri,
    dispatch,
    trackingArea: "vocabulary-sheet-view",
  });

  useRefreshVocabularySheetViewOnNotifications(notifications, dispatch);

  const onIncludeImportedToggle = () => {
    const query = vocabularyIri.namespace
      ? namespaceQueryParam(vocabularyIri.namespace)
      : new Map<string, string>();
    query.set("includeImported", (!includeImported).toString());
    Routing.transitionTo(Routes.vocabularySheetView, {
      params: new Map([["name", vocabularyIri.fragment]]),
      query,
    });
  };

  const onTermSelect = (term: Term) => {
    Routing.transitionToAsset(term, {
      query: new Map([["includeImported", includeImported.toString()]]),
    });
  };

  const onOpenVocabularyDetail = () => {
    Routing.transitionTo(Routes.vocabularySummary, {
      params: new Map([["name", vocabularyIri.fragment]]),
      query: vocabularyIri.namespace
        ? namespaceQueryParam(vocabularyIri.namespace)
        : undefined,
    });
  };

  const onCreateClick = () => {
    Routing.transitionTo(Routes.createVocabularyTerm, {
      params: new Map([["name", vocabularyIri.fragment]]),
      query: vocabularyIri.namespace
        ? namespaceQueryParam(vocabularyIri.namespace)
        : undefined,
    });
  };

  const vocabularyLabel =
    vocabulary !== EMPTY_VOCABULARY
      ? getLocalized(vocabulary.label, getShortLocale(locale))
      : vocabularyIri.fragment;
  const hasImportedVocabularies =
    vocabulary !== EMPTY_VOCABULARY &&
    Utils.sanitizeArray(vocabulary.importedVocabularies).length > 0;

  return (
    <div id="vocabulary-sheet-view">
      <WindowTitle
        title={`${vocabularyLabel} | ${i18n("glossary.table.workspace.title")}`}
      />
      <PromiseTrackingMask area="vocabulary-sheet-view" />
      <HeaderWithActions
        id="vocabulary-sheet-view-header"
        title={`${vocabularyLabel} - ${i18n("glossary.table.workspace.title")}`}
        actions={[
          <Button
            key="sheet-view-back"
            color="secondary"
            size="sm"
            outline={true}
            onClick={onOpenVocabularyDetail}
            title={i18n("glossary.table.workspace.back.help")}
          >
            {i18n("glossary.table.workspace.back")}
          </Button>,
          <IfVocabularyActionAuthorized
            key="sheet-view-create-authorized"
            vocabulary={vocabulary as Vocabulary}
            requiredAccessLevel={AccessLevel.WRITE}
          >
            <Button
              id="sheet-view-create"
              color="primary"
              size="sm"
              title={i18n("glossary.createTerm.tooltip")}
              onClick={onCreateClick}
            >
              <GoPlus />
              &nbsp;{i18n("glossary.new")}
            </Button>
          </IfVocabularyActionAuthorized>,
        ]}
      />
      <Card>
        <CardBody>
          {hasImportedVocabularies && (
            <div className="d-flex mb-3">
              <div className="mr-2">
                <IncludeImportedTermsToggle
                  id="sheet-view-include-imported"
                  onToggle={onIncludeImportedToggle}
                  includeImported={includeImported}
                />
              </div>
            </div>
          )}
          {vocabulary !== EMPTY_VOCABULARY && (
            <VocabularySheetViewTable
              vocabulary={vocabulary}
              includeImported={includeImported}
              selectedTermIri={selectedTerm ? selectedTerm.iri : null}
              onTermSelect={onTermSelect}
            />
          )}
        </CardBody>
      </Card>
    </div>
  );
};

export default VocabularySheetViewPage;

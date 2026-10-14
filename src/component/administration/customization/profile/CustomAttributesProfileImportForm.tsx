import { CustomAttributesProfile } from "../../../../model/CustomAttributesProfile";
import {
  ChangeEvent,
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { TFunction, useI18n } from "../../../hook/useI18n";
import { ThunkDispatch } from "../../../../util/Types";
import { useDispatch } from "react-redux";
import { trackPromise } from "react-promise-tracker";
import { useDebouncedCallback } from "use-debounce";
import {
  downloadProfileFromUri,
  loadProfileFromFile,
} from "../../../../action/AsyncCustomizationActions";
import Constants from "../../../../util/Constants";
import { Label } from "reactstrap";
import CustomInput from "../../../misc/CustomInput";
import UploadFile from "../../../resource/file/UploadFile";
import { getLocalized } from "../../../../model/MultilingualString";
import TextArea from "../../../misc/TextArea";
import PromiseTrackingMask from "../../../misc/PromiseTrackingMask";
import {
  AsyncActionSuccess,
  AsyncFailureAction,
} from "../../../../action/ActionType";
import ValidationResult from "../../../../model/form/ValidationResult";
import { ErrorData } from "../../../../model/ErrorInfo";
import AsyncActionStatus from "../../../../action/AsyncActionStatus";

export interface CustomAttributesProfileImportFormProps {
  profile: CustomAttributesProfile | null;
  setProfile: (profile: CustomAttributesProfile | null) => void;
}

export interface CustomAttributesProfileImportFormHandle {
  reset: () => void;
}

type OptValidationResult = ValidationResult | undefined;
type ProfileResult =
  | AsyncActionSuccess<CustomAttributesProfile>
  | AsyncFailureAction;
type ProfileConsumer = (profile: CustomAttributesProfile | null) => void;
type ValidationConsumer = (validation: OptValidationResult) => void;

export const DOWNLOAD_PROMISE_AREA = "custom-attributes-profile-download-area";
const ACCEPT = [".json", ".jsonld"];

function getMessageFromError(error: ErrorData | null, i18n: TFunction) {
  if (!error) {
    return undefined;
  }
  if (error.messageId) {
    return i18n(error.messageId);
  } else if (error.message) {
    return error.message;
  } else if (error.status) {
    return `status ${error.status}`;
  } else {
    return "";
  }
}

function handleProfileResult(
  result: ProfileResult,
  profileConsumer: ProfileConsumer,
  validationConsumer: ValidationConsumer,
  i18n: TFunction,
  messageKey: string
): void {
  let errorReason: string | undefined = undefined;
  if (result.status === AsyncActionStatus.SUCCESS && "payload" in result) {
    profileConsumer(result.payload);
    validationConsumer(ValidationResult.VALID);
    return;
  } else if ("error" in result) {
    errorReason = getMessageFromError(result.error, i18n);
  }
  if (errorReason !== undefined) {
    const message = i18n(messageKey);
    if (errorReason != "") {
      validationConsumer(
        ValidationResult.blocker(`${message}: ${errorReason}`)
      );
    } else {
      validationConsumer(ValidationResult.blocker(message));
    }
    profileConsumer(null);
  }
}

function handleFileResult(
  result: ProfileResult,
  profileConsumer: ProfileConsumer,
  validationConsumer: ValidationConsumer,
  i18n: TFunction
) {
  handleProfileResult(
    result,
    profileConsumer,
    validationConsumer,
    i18n,
    "administration.customization.customAttributes.profile.import.invalidProfile"
  );
}

function handleDownloadResult(
  result: ProfileResult,
  profileConsumer: ProfileConsumer,
  validationConsumer: ValidationConsumer,
  i18n: TFunction
) {
  handleProfileResult(
    result,
    profileConsumer,
    validationConsumer,
    i18n,
    "administration.customization.customAttributes.profile.import.downloadFailed"
  );
}

export const CustomAttributesProfileImportForm = forwardRef<
  CustomAttributesProfileImportFormHandle,
  CustomAttributesProfileImportFormProps
>(({ profile, setProfile }, ref) => {
  const { i18n, locale } = useI18n();
  const dispatch: ThunkDispatch = useDispatch();

  const abortControllerRef = useRef(new AbortController());

  const [downloadUri, setDownloadUri] = useState("");

  const [uriValidationResult, setUriValidationResult] =
    useState<OptValidationResult>(undefined);
  const [fileValidationResult, setFileValidationResult] =
    useState<OptValidationResult>(undefined);

  const downloadProfile = useDebouncedCallback((uri) => {
    trackPromise(
      dispatch(downloadProfileFromUri(uri, abortControllerRef.current)),
      DOWNLOAD_PROMISE_AREA
    ).then((result) =>
      handleDownloadResult(result, setProfile, setUriValidationResult, i18n)
    );
  }, Constants.SEARCH_DEBOUNCE_DELAY);

  const loadFile = useCallback(
    (file: File) => {
      trackPromise(
        dispatch(loadProfileFromFile(file)),
        DOWNLOAD_PROMISE_AREA
      ).then((result) =>
        handleFileResult(result, setProfile, setFileValidationResult, i18n)
      );
    },
    [dispatch, i18n, setProfile]
  );

  const cancelPending = useCallback(() => {
    downloadProfile.cancel();
    abortControllerRef.current.abort();
    abortControllerRef.current = new AbortController();
  }, [downloadProfile]);

  useImperativeHandle(
    ref,
    () => ({
      reset: () => {
        setDownloadUri("");
        setProfile(null);
        setUriValidationResult(undefined);
        setFileValidationResult(undefined);
      },
    }),
    [setProfile]
  );

  const onUriChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDownloadUri(value);
    cancelPending();
    if (value.trim().length > 0) {
      downloadProfile(value.trim());
    } else {
      setUriValidationResult(undefined);
    }
  };

  const onFileSelected = (file: File) => {
    cancelPending();
    loadFile(file);
  };

  return (
    <>
      <Label>
        {i18n(
          "administration.customization.customAttributes.profile.import.description"
        )}
      </Label>
      <CustomInput
        type={"url"}
        label={i18n(
          "administration.customization.customAttributes.profile.import.url.label"
        )}
        hint={i18n(
          "administration.customization.customAttributes.profile.import.url.hint"
        )}
        value={downloadUri}
        onChange={onUriChange}
        validation={uriValidationResult}
      />
      <UploadFile
        setFile={onFileSelected}
        accept={ACCEPT}
        validation={fileValidationResult}
      />
      <div className={"loading-wrapper"}>
        <CustomInput
          label={i18n(
            "administration.customization.customAttributes.profile.name"
          )}
          placeholder={i18n(
            "administration.customization.customAttributes.profile.import.selectProfile"
          )}
          readOnly={true}
          value={getLocalized(profile?.title, locale)}
        />
        <TextArea
          label={i18n(
            "administration.customization.customAttributes.profile.description"
          )}
          rows={3}
          readOnly={true}
          value={getLocalized(profile?.description, locale)}
        />
        <PromiseTrackingMask
          area={DOWNLOAD_PROMISE_AREA}
          text={i18n(
            "administration.customization.customAttributes.profile.import.loading"
          )}
        />
      </div>
    </>
  );
});

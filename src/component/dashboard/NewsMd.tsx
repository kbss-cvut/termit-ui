import * as React from "react";
import ContainerMask from "../misc/ContainerMask";
import { getShortLocale } from "../../util/IntlUtil";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadNews } from "../../action/AsyncActions";
import { useI18n } from "../hook/useI18n";
import MarkdownView from "../misc/MarkdownView";

const NewsMd: React.FC = () => {
  const { locale } = useI18n();
  const [newsMd, setNewsMd] = React.useState<string | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadNews(getShortLocale(locale))).then((data) => setNewsMd(data));
  }, [locale, dispatch]);

  return newsMd ? <MarkdownView>{newsMd}</MarkdownView> : <ContainerMask />;
};

export default NewsMd;

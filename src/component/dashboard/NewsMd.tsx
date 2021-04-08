import * as React from "react";
import ReactMarkdown from "react-markdown";
import ContainerMask from "../misc/ContainerMask";
import { getShortLocale } from "../../util/IntlUtil";
import { useDispatch } from "react-redux";
import { ThunkDispatch } from "../../util/Types";
import { loadNews } from "../../action/AsyncActions";
import { useI18n } from "../hook/useI18n";

const NewsMd: React.FC = () => {
  const { locale } = useI18n();
  const [newsMd, setNewsMd] = React.useState<string | null>(null);
  const dispatch: ThunkDispatch = useDispatch();
  React.useEffect(() => {
    dispatch(loadNews(getShortLocale(locale))).then((data) => setNewsMd(data));
  }, [locale, dispatch]);

  return newsMd ? <ReactMarkdown source={newsMd} /> : <ContainerMask />;
};

export default NewsMd;

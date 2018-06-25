import withRoot from '../components/styles/withRoot';
import View from '../components/result';
import { withContextProvider } from '../components/result/store';
import { withAboutContextProvider } from '../components/about/store';
import { withI18nContextProvider } from '../components/i18n/store';

const ViewWithAboutContextProvider = withAboutContextProvider(View);
const ViewWithI18nContextProvider = withI18nContextProvider(ViewWithAboutContextProvider);
const ViewWithContextProvider = withContextProvider(ViewWithI18nContextProvider);
const Result = withRoot(ViewWithContextProvider);

export default Result;

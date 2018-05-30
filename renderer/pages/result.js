import withRoot from '../components/styles/withRoot';
import View from '../components/result';
import { withContextProvider } from '../components/result/store';
import { withAboutContextProvider } from '../components/about/store';

const ViewWithAboutContextProvider = withAboutContextProvider(View);
const ViewWithContextProvider = withContextProvider(ViewWithAboutContextProvider);
const Result = withRoot(ViewWithContextProvider);

export default Result;

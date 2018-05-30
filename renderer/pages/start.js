import withRoot from '../components/styles/withRoot';
import View from '../components/start';
import { withContextProvider } from '../components/start/store';
import { withAboutContextProvider } from '../components/about/store';

const ViewWithAboutContextProvider = withAboutContextProvider(View);
const ViewWithContextProvider = withContextProvider(ViewWithAboutContextProvider);
const Start = withRoot(ViewWithContextProvider);

export default Start;

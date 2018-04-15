import withRoot from '../components/styles/withRoot';
import View from '../components/start';
import { withContextProvider } from '../store';

const ViewWithContextProvider = withContextProvider(View);
const Start = withRoot(ViewWithContextProvider);

export default Start;

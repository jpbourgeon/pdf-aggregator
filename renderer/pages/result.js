import withRoot from '../components/styles/withRoot';
import View from '../components/result';
import { withContextProvider } from '../store';

const ViewWithContextProvider = withContextProvider(View);
const Result = withRoot(ViewWithContextProvider);

export default Result;

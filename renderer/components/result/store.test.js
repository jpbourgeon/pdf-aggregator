const React = require('react');
const TestRenderer = require('react-test-renderer');
const Router = require('next/router').default;
const { ContextProvider } = require('./store');

jest.mock('next/router');
Date.now = jest.fn(() => 'MOCKED_DATE');

describe('Given the result store ContextProvider component', () => {
  let instance;
  beforeEach(() => {
    const renderer = TestRenderer.create(<ContextProvider><div /></ContextProvider>);
    ({ instance } = renderer.root);
  });

  describe('the async lifecycle method componentDidMount', () => {
    it('should call the method setCurrentTask', async () => {
      expect.assertions(1);
      instance.setCurrentTask = jest.fn();
      await instance.componentDidMount()
        .catch(e => console.log(`componentDidMount: ${e.message}`)); // eslint-disable-line no-console
      expect(instance.setCurrentTask).toHaveBeenCalled();
    });

    it('should call the method initStore', () => {
      expect.assertions(1);
      instance.initStore = jest.fn();
      instance.componentDidMount();
      expect(instance.initStore).toHaveBeenCalled();
    });

    it('should call the method addLogEntry', async () => {
      expect.assertions(1);
      instance.addLogEntry = jest.fn();
      await instance.componentDidMount()
        .catch(e => console.log(`componentDidMount: ${e.message}`)); // eslint-disable-line no-console
      expect(instance.addLogEntry).toHaveBeenCalled();
    });
  });

  describe('the method addLogEntry', () => {
    it('should add an entry at the beginning of the log (unshift)', () => {
      instance.addLogEntry({ label: 'value1' });
      instance.addLogEntry({ label: 'value2' });
      expect(instance.state.log[0]).toEqual({ label: 'value2' });
    });

    it('should update the state to indicate that the job hasErrors if the entry is an error', () => {
      instance.addLogEntry({ isError: true, isLast: false });
      expect(instance.state.job.hasErrors).toBeTruthy();
    });

    it('should update the state to indicate that the job isDone if the entry is the last one', () => {
      instance.addLogEntry({ isError: false, isLast: true });
      expect(instance.state.job.isDone).toBeTruthy();
    });
  });

  describe('the method goHome', () => {
    it('should navigate to the start page', () => {
      instance.goHome({ preventDefault: jest.fn() });
      expect(Router.push).toHaveBeenCalledWith('/start', '/start');
    });
  });

  describe('the async method initStore', () => {
    it('should initialise the store with the data provided', async () => {
      expect.assertions(1);
      const data = { input: 'hello world' };
      await instance.initStore(() => data)
        .catch(e => console.log(`instance.initStore: ${e.message}`)); // eslint-disable-line no-console
      expect(instance.state.data).toEqual(data);
    });
  });

  describe('the method openOutputFolder', () => {
    it('should call electron\'s shell.showItemInFolder with the output folder\'s fullpath', () => {
      instance.setState({ data: { output: 'path' } });
      instance.openOutputFolder(instance.state.data.output);
      expect(instance.openItem).toHaveBeenCalledWith(instance.state.data.output);
    });
  });

  describe('the method switchBool', () => {
    it('should switch a boolean state property to its opposite value', () => {
      instance.initStore(() => ({}));
      const job = { ...instance.state.job, isDone: false };
      instance.setState({ job });
      instance.switchBool('job.isDone');
      expect(instance.state.job.isDone).toBeTruthy();
    });
  });
});

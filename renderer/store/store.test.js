const React = require('react');
const TestRenderer = require('react-test-renderer');
const { ContextProvider } = require('../store');


describe('Given the application store ContextProvider component', () => {
  let instance;
  beforeEach(() => {
    const renderer = TestRenderer.create(<ContextProvider><div /></ContextProvider>);
    ({ instance } = renderer.root);
  });

  describe('the method initStore', () => {
    it('should initialise the store with the data provided', () => {
      const data = { input: 'hello world' };
      const expectedState = Object.assign(instance.defaultState, { data });
      instance.initStore(() => data);
      expect(instance.state).toEqual(expectedState);
    });

    it('should initialise the store with the default when the data provided is an empty object', () => {
      instance.initStore(() => ({}));
      expect(instance.state).toEqual({ ...instance.defaultState });
    });
  });

  describe('the method handleChange', () => {
    beforeEach(() => {
      instance.initStore(() => ({}));
    });

    it('should set a state property from a target\'s string value', () => {
      instance.handleChange('key', { target: { value: 'value' } });
      expect(instance.state.data.key).toEqual('value');
    });

    it('should set a state property from a target\'s checked value', () => {
      instance.handleChange('key', { target: { checked: false } }, 'checked');
      expect(instance.state.data.key).toBeFalsy();
    });
  });

  describe('the method resetState', () => {
    it('should reset the state to the default', () => {
      instance.initStore(() => ({ key: 'value' }));
      instance.resetState();
      expect(instance.state).toEqual({ ...instance.defaultState });
    });
  });

  describe('the method submit', () => {
    it('should work');
  });

  describe('the method getFolder', () => {
    it('should open the native folder picker', () => {
      instance.getFolder(
        'input',
        instance.openDialog,
        instance.currentWindow,
        instance.dialogOptions,
      );
      expect(instance.openDialog).toHaveBeenCalledWith(
        instance.currentWindow,
        instance.dialogOptions,
      );
    });
  });

  describe('the lifecycle method componentDidMount', () => {
    it('should call the method initStore', () => {
      instance.initStore = jest.fn();
      instance.componentDidMount();
      expect(instance.initStore).toHaveBeenCalled();
    });
  });

  describe('the lifecycle method componentDidUpdate', () => {
    it('should persist the state if it has changed', () => {
      instance.initStore(() => ({ key: 'new value' }));
      instance.db.setState.mockClear();
      instance.componentDidUpdate(null, { data: { key: 'previous value' } });
      expect(instance.db.setState).toHaveBeenCalledTimes(1);
    });

    it('should not persist the state if it hasn\'t changed', () => {
      instance.initStore(() => ({ key: 'value' }));
      instance.db.setState.mockClear();
      instance.componentDidUpdate(null, { data: { key: 'value' } });
      expect(instance.db.setState).not.toHaveBeenCalled();
    });
  });
});

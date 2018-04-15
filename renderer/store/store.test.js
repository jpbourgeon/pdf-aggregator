const React = require('react');
const TestRenderer = require('react-test-renderer');
const Router = require('next/router').default;
const { ContextProvider } = require('../store');

jest.mock('next/router');

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

  describe('the method handleLevelChange', () => {
    const makeEvent = value => ({
      target: {
        value,
      },
    });
    it('should set the level correctly if the value provided is a positive integer', () => {
      const event = makeEvent('2');
      instance.handleLevelChange(event);
      expect(instance.state.data.level).toBe(2);
    });

    it('should set the default value if the value provided is an integer below 1', () => {
      const event = makeEvent('-1');
      instance.handleLevelChange(event);
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
    });

    it('should set the default value if the value provided is not a number', () => {
      const event = makeEvent('not a number');
      instance.handleLevelChange(event);
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
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
    it('should navigate to the result page', () => {
      instance.submit();
      expect(Router.push).toHaveBeenCalledWith('/result', '/result', { shallow: true });
    });
  });

  describe('the method getFolder', () => {
    it('should open the native folder picker', () => {
      instance.getFolder('input');
      expect(instance.openDialog).toHaveBeenCalledWith(
        instance.currentWindow,
        instance.dialogOptions,
      );
    });
    it('should save the path to the state\'s data to the provided field', () => {
      instance.openDialog = jest.fn().mockReturnValueOnce('/path/');
      instance.getFolder('input');
      expect(instance.state.data.input).toBe('/path/');
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

  describe.only('the method validateForm', () => {
    it('should work');
  });
});

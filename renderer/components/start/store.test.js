const React = require('react');
const TestRenderer = require('react-test-renderer');
const Router = require('next/router').default;
const { ContextProvider } = require('./store');

jest.mock('next/router');

describe('Given the start store ContextProvider component', () => {
  let instance;
  beforeEach(() => {
    const renderer = TestRenderer.create(<ContextProvider><div /></ContextProvider>);
    ({ instance } = renderer.root);
  });

  describe('the method initStore', () => {
    it('should initialise the store with the data provided', () => {
      const data = { input: 'hello world' };
      const expectedState = { ...instance.defaultState, data };
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

  describe('the method handleLevelOrDepthChange', () => {
    const makeEvent = value => ({
      target: {
        value,
      },
    });

    it('should set the level correctly if the integer provided equals the default value', () => {
      instance.handleLevelOrDepthChange('level', makeEvent(instance.defaultState.data.level));
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
      instance.handleLevelOrDepthChange('depth', makeEvent(instance.defaultState.data.depth));
      expect(instance.state.data.depth).toBe(instance.defaultState.data.depth);
    });

    it('should set the level correctly if the integer provided is greater than the default value', () => {
      instance.handleLevelOrDepthChange('level', makeEvent('5'));
      expect(instance.state.data.level).toBe(5);
    });

    it('should set the default value if the integer provided is lower than the default value', () => {
      instance.handleLevelOrDepthChange('level', makeEvent('-5'));
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
      instance.handleLevelOrDepthChange('depth', makeEvent('-5'));
      expect(instance.state.data.depth).toBe(instance.defaultState.data.depth);
    });

    it('should set the default value if the value provided is not an integer or the character \'-\'', () => {
      instance.handleLevelOrDepthChange('level', makeEvent('not an integer or \'-\''));
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
    });

    it('should allow the character \'-\' as an input for default the value', () => {
      instance.handleLevelOrDepthChange('level', makeEvent('-'));
      expect(instance.state.data.level).toBe(instance.defaultState.data.level);
      instance.handleLevelOrDepthChange('depth', makeEvent('-'));
      expect(instance.state.data.depth).toBe(instance.defaultState.data.depth);
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
      instance.submit({ preventDefault: jest.fn() });
      expect(Router.push).toHaveBeenCalledWith('/result', '/result');
    });
  });

  describe('the method setFolder', () => {
    it('should open the native folder picker', () => {
      instance.setFolder('input');
      expect(instance.openDialog).toHaveBeenCalledWith(
        instance.currentWindow,
        instance.foldersOptions,
      );
    });

    it('should save the selected path to the provided field of the state\'s data property', () => {
      instance.openDialog = jest.fn().mockReturnValueOnce('/path/');
      instance.setFolder('input');
      expect(instance.state.data.input).toBe('/path/');
    });
  });

  describe('the method setLogo', () => {
    it('should open the native file picker', () => {
      instance.setLogo();
      expect(instance.openDialog).toHaveBeenCalledWith(
        instance.currentWindow,
        instance.imagesOptions,
      );
    });

    it('should save the selected path to the provided field of the state\'s data property', () => {
      instance.openDialog = jest.fn().mockReturnValueOnce('/path/to/image.jpg');
      instance.setLogo();
      expect(instance.state.data.logo).toBe('/path/to/image.jpg');
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

  describe('the method isDataValid', () => {
    const makeData = () => ({
      data: {
        input: 'path',
        output: 'path',
        filename: '%dossiersource%_%dateiso%',
        title: '%dossiersource%%ligne%%datefr%',
        level: 0,
        depth: 0,
        changelog: true,
        documentOutline: true,
      },
    });

    it('should return false if input folder is empty', () => {
      const state = makeData();
      state.data.input = '';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if output folder is empty', () => {
      const state = makeData();
      state.data.output = '';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if filename is empty', () => {
      const state = makeData();
      state.data.filename = '';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if title is empty', () => {
      const state = makeData();
      state.data.title = '';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if level is not a number', () => {
      const state = makeData();
      state.data.level = 'value';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if depth is not a number', () => {
      const state = makeData();
      state.data.depth = 'value';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if level is a negative integer', () => {
      const state = makeData();
      state.data.level = '-5';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return false if depth is a negative integer', () => {
      const state = makeData();
      state.data.depth = '-5';
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeFalsy();
      });
    });

    it('should return true otherwise', () => {
      const state = makeData();
      let result;
      instance.setState({ ...state }, () => {
        result = instance.isDataValid();
        expect(result).toBeTruthy();
      });
    });
  });
});

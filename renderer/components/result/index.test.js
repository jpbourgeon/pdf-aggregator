const React = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');
const { RenderView } = require('../result');
const { defaultState } = require('./store');

describe('The renderView component of the result page', () => {
  it('should render correctly', () => {
    Date.now = jest.fn(() => 'MOCKED_DATE');
    const props = {
      actions: {
        openDialog: jest.fn(),
        setFolder: jest.fn(),
        handleChange: jest.fn(),
        resetState: jest.fn(),
        isDataValid: jest.fn(),
        submit: jest.fn(),
      },
      aboutActions: {
        open: jest.fn(),
      },
      i18nActions: {
        t9n: jest.fn(),
      },
      classes: {
        root: jest.fn(),
        title: jest.fn(),
        formControl: jest.fn(),
        smallFormControl: jest.fn(),
        button: jest.fn(),
      },
      state: defaultState,
    };
    const renderer = new ShallowRenderer();
    renderer.render(<RenderView {...props} />);
    const result = renderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
});

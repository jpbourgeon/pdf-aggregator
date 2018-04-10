const React = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');
const { RenderView } = require('../start');
const { defaultState } = require('../../store');

describe('The renderView component', () => {
  it('should render correctly', () => {
    const props = {
      actions: {
        openDialog: () => jest.fn(),
        getFolder: () => jest.fn(),
        handleChange: () => jest.fn(),
        resetState: () => jest.fn(),
        submit: () => jest.fn(),
      },
      classes: {
        root: jest.fn(),
        title: jest.fn(),
        formControl: jest.fn(),
        smallFormControl: jest.fn(),
        button: jest.fn(),
      },
      parameters: {
        currentWindow: jest.fn(),
        dialogOptions: () => jest.fn(),
      },
      state: defaultState,
    };
    const renderer = new ShallowRenderer();
    renderer.render(<RenderView {...props} />);
    const result = renderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
});

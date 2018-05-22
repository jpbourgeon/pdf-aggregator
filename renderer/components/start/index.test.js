const React = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');
const { RenderView } = require('../start');
const { defaultState } = require('./store');

describe('The renderView component of the start page', () => {
  it('should render correctly', () => {
    const props = {
      actions: {
        openDialog: jest.fn(),
        setFolder: jest.fn(),
        handleChange: jest.fn(),
        resetState: jest.fn(),
        isDataValid: jest.fn(),
        submit: jest.fn(),
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

describe('todo', () => {
  it('should have a page number option');
  it('should have a toc option');
  it('should be localized (react-i18n + i18next-electron-language-detector)');
});

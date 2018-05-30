const React = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');
const { AboutRenderView } = require('../about');

describe('The renderView component of the about modal', () => {
  it('should render correctly', () => {
    const props = {
      aboutState: {
        open: false,
        data: {
          name: 'name',
          description: 'description',
          version: 'version',
          releases: 'releases',
          github: 'github',
          author: 'author',
          email: 'email',
          license: 'license',
        },
      },
      aboutActions: {
        open: jest.fn(),
        close: jest.fn(),
      },
      classes: {
        paper: {},
        cardActions: {},
      },
    };
    const renderer = new ShallowRenderer();
    renderer.render(<AboutRenderView {...props} />);
    const result = renderer.getRenderOutput();
    expect(result).toMatchSnapshot();
  });
});

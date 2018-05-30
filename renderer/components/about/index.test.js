const React = require('react');
const ShallowRenderer = require('react-test-renderer/shallow');
const { AboutRenderView } = require('../about');

describe('The renderView component of the about modal', () => {
  it('should render correctly', () => {
    const props = {
      aboutState: {
        open: false,
        data: {
          name: 'data.name',
          description: 'Une application de bureau pour fusionner des arborescences de documents PDF',
          version: 'data.version',
          releases: 'https://github.com/jpbourgeon/pdf-aggregator/releases',
          github: 'https://github.com/jpbourgeon/pdf-aggregator',
          author: 'Jean-Philippe Bourgeon',
          email: 'jeanphilippe.bourgeon@gmail.com',
          license: 'https://raw.githubusercontent.com/jpbourgeon/pdf-aggregator/master/LICENSE.txt',
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

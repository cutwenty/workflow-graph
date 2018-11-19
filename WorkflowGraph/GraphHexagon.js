
import PropTypes from 'prop-types';

import GraphDiamond from './GraphDiamond';

import styles from './WorkflowGraph.module.less';

class GraphHexagon extends GraphDiamond {

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    attrs: PropTypes.object,
    detail: PropTypes.object,
    theme: PropTypes.string,
    bounds: PropTypes.object,
  };

  getShapeAttr() {
    const { bounds: {x, y, width, height} } = this.props;
    const points = [[x-1, height/2+y], [width/4+x, y], [width/4*3+x, y], [width+x+1, height/2+y], [width/4*3+x, height+y], [width/4+x, height+y]].join(' ');
    return {
      ...super.getShapeAttr(),
      points,
    };
  }

}

export default GraphHexagon;

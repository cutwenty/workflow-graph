
import React from 'react';
import PropTypes from 'prop-types';

import Shape from './Shape';

import styles from './WorkflowGraph.module.less';

class GraphCircle extends Shape {

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
    const { bounds } = this.props;
    return {
      ...super.getShapeAttr(),
      cx: bounds.x+bounds.width/2,
      cy: bounds.y+bounds.width/2,
      r: bounds.width/2,
    };
  }

  renderShape() {
    return (
      <circle
        {...this.getShapeAttr()}
      />
    );
  }
}

export default GraphCircle;

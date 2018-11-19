
import React from 'react';
import PropTypes from 'prop-types';

import Shape from './Shape';

import styles from './WorkflowGraph.module.less';

class GraphPolyline extends Shape {

  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    attrs: PropTypes.object,
    detail: PropTypes.object,
    theme: PropTypes.string,
    bounds: PropTypes.object,

    waypoint: PropTypes.array,
    labelBounds: PropTypes.object,
  };

  getShapeAttr() {
    const { waypoint } = this.props;
    const points = waypoint.join(' ');
    return {
      ...super.getShapeAttr(),
      strokeWidth: '3',
      fill: 'none',
      points,
    };
  }
  getPoints() {
    const { waypoint } = this.props;
    const radians = Math.PI/180*15;
    const arrowL = 15;
    const [x1, y1] = waypoint[waypoint.length-1];
    const [x2, y2] = waypoint[waypoint.length-2];
    const points = [];

    let l = Math.sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
    let sin1 = (y2-y1)/l;
    let cos1 = (x2-x1)/l;

    let sin2 = sin1*Math.cos(radians)+cos1*Math.sin(radians);
    let cos2 = cos1*Math.cos(radians)-sin1*Math.sin(radians);
    let sin3 = sin1*Math.cos(radians)-cos1*Math.sin(radians);
    let cos3 = cos1*Math.cos(radians)+sin1*Math.sin(radians);

    points.push([cos2*arrowL+x1, sin2*arrowL+y1]);
    points.push([x1, y1]);
    points.push([cos3*arrowL+x1, sin3*arrowL+y1]);
    return points.join(' ');
  }
  renderArrow() {
    return (
      <polyline
        {...super.getShapeAttr()}
        strokeWidth='3'
        points={this.getPoints()}
      />
    );
  }
  renderShape() {
    const { name, labelBounds } = this.props;
    return (
      <>
        <polyline
          {...this.getShapeAttr()}
        />
        { this.renderArrow() }
        { super.renderLabel(name, labelBounds, true) }
      </>
    );
  }
}

export default GraphPolyline;

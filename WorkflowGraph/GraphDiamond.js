
import React from 'react';
import PropTypes from 'prop-types';
import uuidv4 from 'uuid/v4';

import Shape from './Shape';

import styles from './WorkflowGraph.module.less';

class GraphDiamond extends Shape {

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
    const { bounds: { x, y, width, height } } = this.props;
    const points = [[x-1, height/2+y], [width/2+x, y], [width+x+1, height/2+y], [width/2+x, height+y]].join(' ');
    return {
      ...super.getShapeAttr(),
      points,
    };
  }
  renderPopoverContent() {
    const { detail } = this.props;
    if (!detail) {
      return null;
    }
    return (
      <div className={styles['popover-content']}>
        <table cellPadding="4px" cellSpacing="4px">
          <tbody>
            {
              detail.nodeDetails.map(({detailName, detailValue}) => {
                return (
                  <tr key={uuidv4()}>
                    <td><span>{detailName}：</span></td>
                    <td><span>{detailValue}</span></td>
                  </tr>
                );
              })
            }
          </tbody>
        </table>
      </div>
    );
  }
  renderShape() {
    const { name, bounds } = this.props;
    return (
      <>
        <polygon
          {...this.getShapeAttr()}
        />
        { this.renderLabel(name, bounds) }
      </>
    );
  }
}

export default GraphDiamond;

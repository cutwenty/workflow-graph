
import React, { Component } from 'react';
import {
  Popover
} from 'antd';
import PropTypes from 'prop-types';

import styles from './WorkflowGraph.module.less';

class Shape extends Component {
  static propTypes = {
    type: PropTypes.string,
    id: PropTypes.string,
    name: PropTypes.string,
    attrs: PropTypes.object,
    detail: PropTypes.object,
    theme: PropTypes.string,
    bounds: PropTypes.object,
  };
  /**
   * 主题色
   *
   * @memberof Shape
   */
  themes = {
    default: {
      stroke: '#20B68E',
      fill: '#20B68E',
    },
  }
  constructor(props) {
    super(props);
    this.state = {
      outlineVisible: false,
    };
  }
  /**
   * 获取图型的属性
   *
   * @returns
   * @memberof Shape
   */
  getShapeAttr() {
    const { id, name, theme = 'default' } = this.props;
    return {
      ...this.themes[theme],
      id,
      name,
    };
  }
  /**
   * 画文字内容，如果是线条，可能会换行，multLine要为true
   *
   * @param {*} text
   * @param {*} bounds
   * @param {boolean} [multLine=false]
   * @returns
   * @memberof Shape
   */
  renderLabel(text, bounds, multLine = false) {
    const style = !multLine? {lineHeight: bounds.height+'px'}: null;
    return (
      <switch>
        <foreignObject style={style} {...bounds}>
          <p xmlns="http://www.w3.org/1999/xhtml" className={styles['text']}>{text}</p>
        </foreignObject>
        <text {...bounds}>{text}</text>
      </switch>
    );
  }
  renderOutline() {
    if (!this.props.bounds) {
      return null;
    }
    const { bounds: {x, y, width, height}, theme = 'default' } = this.props;
    const attrs = {
      ...this.themes[theme],
      fill: 'none',
      strokeWidth: '1px',
      strokeDasharray: '3,3',
      shapeRendering: 'crispedges',
    }
    return (
      <rect
        {...attrs}
        style={{
          visibility: 'hidden',
        }}
        x={x-6}
        y={y-6}
        height={height+12}
        width={width+12}
      />
    );
  }
  renderPopoverContent() {
    return null;
  }
  render() {
    const popoverContent = this.renderPopoverContent();
    const shapeContent = (
      <g className={styles['shape']}>
        { this.renderShape() }
      </g>
    );
    if (!popoverContent) {
      return shapeContent;
    }
    return (
      <Popover content={popoverContent}>
        { shapeContent }
      </Popover>
    );
  }
}

export default Shape;

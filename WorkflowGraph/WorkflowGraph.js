
import React, { Component } from 'react';
import { createPortal } from 'react-dom';
import {
  Icon,
} from 'antd';
import PropTypes from 'prop-types';
import { Bind } from 'lodash-decorators';
import classNames from 'classnames';

// import BpmnModdle from 'bpmn-moddle';

import GraphCircle from './GraphCircle';
import GraphDiamond from './GraphDiamond';
import GraphHexagon from './GraphHexagon';
import GraphPolyline from './GraphPolyline';

import styles from './WorkflowGraph.module.less';


/**
 * 异步执行函数
 * @param {*} fn
 */
function async(fn = noop, timeout = 10) {
  setTimeout(() => {
    fn();
  }, timeout);
}


/**
 * 把所有图像放在y=0的横线上
 *
 * @param {*} data
 */
function resolveGraphData(data) {
  const types = {
    '01': 'StartEvent',
    '02': 'EndEvent',
    '03': 'UserTask',
    '04': 'ServiceTask',
  };
  const bounds = {
    '01': {
      height: 35,
      width: 35,
    },
    '02': {
      height: 35,
      width: 35,
    },
    '03': {
      height: 55,
      width: 105,
    },
    '04': {
      height: 55,
      width: 105,
    },
  };
  const lineLength = 50;

  // 累计x，y始终为0
  let x = 0;
  let y = 0;
  let lineData = [];
  // 获取节点的数据
  let nodeData = data.map((node) => {
    let nodeBounds = bounds[node.nodeType];
    let posX = x;
    let posY = y - nodeBounds.height/2;

    x = x+nodeBounds.width+lineLength;

    return {
      // 01-开始；02-结束；03-人工；04-自动；05-网关
      type: types[node.nodeType],
      id: node.nodeId,
      name: node.nodeName,
      detail: node,
      bounds: {
        ...nodeBounds,
        x: posX,
        y: posY,
      },
    };
  });
  // 获取节点间线的数据
  for (let i = 1; i < nodeData.length; i++) {
    const { bounds: { x: lastX, width: lastWidth } } = nodeData[i-1];
    const { bounds: { x } } = nodeData[i];
    lineData.push({
      type: 'SequenceFlow',
      id: `SequenceFlow-${i}`,
      waypoint: [
        [lastX+lastWidth, 0],
        [x, 0],
      ],
    });
  }
  return [...nodeData, ...lineData];
}


class WorkflowGraph extends Component {
  static propTypes = {
    xml: PropTypes.string,
    nodesDetail: PropTypes.object,
    className: PropTypes.string,
    style: PropTypes.object,
    moddleData: PropTypes.array,
  };
  static defaultProps = {
    xml: '',
    nodesDetail: {},
    className: '',
    style: {
      height: '400px',
    },
  };
  static getDerivedStateFromProps(nextProps, prevState) {
    // 数据moddleData的来源可以是xml可以是props
    if (nextProps.moddleData && prevState.moddleData.length <= 0) {
      return {
        moddleData: resolveGraphData(nextProps.moddleData),
      };
    }
    return null;
  }
  /**
   * bpmn事件和组件的map
   *
   * @memberof WorkflowGraph
   */
  elementComponents = {
    StartEvent: GraphCircle,
    EndEvent: GraphCircle,
    UserTask: GraphHexagon,
    ServiceTask: GraphDiamond,
    SequenceFlow: GraphPolyline,
  };
  BpmnModdle = null;
  constructor(props) {
    super(props);
    this.state = {
      // 用来和props的xml对比
      xml: '',
      // 渲染图像的数据
      moddleData: [],
      // 渲染图像包装的大小
      size: null,
      fullScreen: false,
    };
    import('bpmn-moddle').then((module) => this.BpmnModdle = module.default);
  }
  /**
   * 切换全屏
   *
   * @memberof WorkflowGraph
   */
  @Bind()
  toggleFullScreen() {
    this.setState({
      fullScreen: !this.state.fullScreen,
    });
  }
  /**
   * 解析xml
   *
   */
  @Bind()
  resolveXML(ele) {
    const { xml } = this.props;
    const { moddleData, size } = this.state;
    // xml 和 state的xml不同
    if (xml && xml !== this.state.xml && this.BpmnModdle) {
      const moddle = new this.BpmnModdle();
      moddle.fromXML(xml, (err, definitions) => {
        const data = this.transformModdleElement(definitions.diagrams[0].plane.planeElement);
        this.setState({
          xml,
          moddleData: data,
          size: this.getGraphSize(data),
        });
      });
    }
    if (!xml && moddleData.length > 0 && !size) {
      async(() => {
        this.setState({
          size: this.getGraphSize(moddleData),
        });
      });
    }
  }
  /**
   * 升序排序
   *
   * @param {*} first
   * @param {*} second
   * @returns
   * @memberof WorkflowGraph
   */
  ascendSort(first, second) {
    if (first === second) {
      return 0;
    } else if (first < second) {
      return -1;
    }
    else {
      return 1;
    }
  }
  /**
   * 从所有的元素的位置坐标获取最小、最大的两个点
   *
   * @param {*} elements
   * @memberof WorkflowGraph
   */
  getGraphSize(moddleData) {
    const graphPadding = 60;
    let xList = [];
    let yList = [];
    let size = {};
    moddleData.map(({bounds, waypoint, labelBounds}) => {
      if (bounds) {
        xList.push(bounds.x);
        yList.push(bounds.y);
      }
      if (labelBounds && labelBounds) {
        xList.push(labelBounds.x);
        yList.push(labelBounds.y);
      }
      if (waypoint) {
        waypoint.map(([x, y]) => {
          xList.push(x);
          yList.push(y);
          return null;
        });
      }
      return null;
    });
    // 排序并取最大、最小值
    xList = xList.sort(this.ascendSort).splice(1, xList.length);
    yList = yList.sort(this.ascendSort).splice(1, xList.length);
    xList.splice(1, xList.length-2);
    yList.splice(1, yList.length-2);

    size = {
      min: [xList[0], yList[0]],
      max: [xList[1], yList[1]],
      width: xList[1] + graphPadding*2,
      height: yList[1] + graphPadding*2,
    };

    return {
      ...size,
      margin: this.getElementMargin(document.querySelector('.'+styles['graph-content']), size, graphPadding),
      fullScreenMargin: this.getElementMargin(document.body, size, graphPadding),
    };
  }
  /**
   * 获取普通、全屏时的margin
   *
   * @param {*} ele
   * @param {*} size
   * @param {*} graphPadding
   * @memberof WorkflowGraph
   */
  getElementMargin(ele, size, graphPadding) {
    // margin: [xList[0]-graphPadding, yList[0]-graphPadding],
    const margin = [];
    const eleHeight = ele.offsetHeight;
    const eleWidth = ele.offsetWidth;
    if (size.width <= eleWidth) {
      margin[0] = (eleWidth-size.width)/2;
    } else {
      margin[0] = -1*(size.min[0]-graphPadding);
    }
    if (size.height <= eleHeight) {
      margin[1] = (eleHeight-size.height)/2;
    } else {
      margin[1] = -1*(size.min[1]-graphPadding);
    }
    return margin;
  }
  /**
   * 将xml的元素转换成画图用的对象
   *
   * @param {*} diagrams
   * @returns
   * @memberof WorkflowGraph
   */
  transformModdleElement(elements) {
    const { nodesDetail } = this.props;
    return elements.map((ele) => {
      const bounds = ele.bounds;
      const waypoint = ele.waypoint;
      const labelBounds = ele.label? ele.label.bounds: null;
      return {
        type: ele.bpmnElement.$type.match(/:([^\s:]+)$/)[1],
        id: ele.bpmnElement.id,
        name: ele.bpmnElement.name,
        attrs: ele.bpmnElement.$attrs,
        detail: nodesDetail[ele.bpmnElement.id],
        bounds: bounds? {
          height: bounds.height,
          width: bounds.width,
          x: bounds.x,
          y: bounds.y,
        }: null,
        waypoint: waypoint? waypoint.map(({x, y}) => ([x, y])): null,
        labelBounds: labelBounds? {
          height: labelBounds.height,
          width: labelBounds.width,
          x: labelBounds.x,
          y: labelBounds.y,
        }: null,
      };
    });
  }
  /**
   * 获取wrapper的样式，大小、位移等
   *
   * @memberof WorkflowGraph
   */
  getWrapperStyle() {
    if (!this.state.size) {
      return null;
    }
    const { size, fullScreen } = this.state;
    const margin = size[fullScreen? 'fullScreenMargin': 'margin'];
    return {
      width: size.width+'px',
      height: size.height+'px',
      marginLeft: `${margin[0]}px`,
      marginTop: `${margin[1]}px`,
    };
  }
  renderTools() {
    const { fullScreen } = this.state;
    return (
      <div className={styles['graph-tools']}>
        <Icon
          type={!fullScreen? 'fullscreen': 'fullscreen-exit'}
          theme="outlined"
          onClick={this.toggleFullScreen}
        />
      </div>
    );
  }
  renderGraph() {
    const { moddleData } = this.state;
    const graphShapes = [];
    moddleData.map((moddle) => {
      const GraphShape = this.elementComponents[moddle.type];
      if (GraphShape) {
        graphShapes.push(<GraphShape key={moddle.id} {...moddle} />);
      }
      return null;
    });
    return (
      <div className={styles['graph-content']}>
        <svg className={styles['graph-svg']} style={this.getWrapperStyle()}>
          { graphShapes }
        </svg>
      </div>
    );
  }
  renderContent() {
    return (
      <>
        { this.renderTools() }
        { this.renderGraph() }
      </>
    );
  }
  render() {
    const { className, style, xml, moddleData } = this.props;
    const { fullScreen } = this.state;
    const graph = (
      <div
        style={style}
        className={classNames({
          [styles['graph-container']]: true,
          [styles['graph-fullscreen']]: fullScreen,
          [styles['graph-placeholder']]: !xml,
        }, className)}
      >
        { (xml || moddleData) && this.renderContent() }
      </div>
    );
    // 解析xml
    this.resolveXML();

    if (fullScreen) {
      return createPortal(
        graph,
        document.querySelector('body'),
      );
    }
    return graph;
  }
}

export default WorkflowGraph;

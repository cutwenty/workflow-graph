
import React from 'react';
import Loadable from 'react-loadable';

import Loading from '../Loading';
import WorkflowGraph from './WorkflowGraph';

const WorkflowGraphWrapper = Loadable({
  delay: 1000,
  loader: () => {
    // 面对bpmn-moddle的加载
    return import('bpmn-moddle').then(raw => {
      return WorkflowGraph;
    })
  },
  loading: () => <Loading inner={true} loading={true} />
});


export default WorkflowGraphWrapper;

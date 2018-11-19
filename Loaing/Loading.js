
import React from 'react';
import { createPortal } from 'react-dom';
import { Spin } from 'antd';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import styles from './Loading.module.less';

const Loading = ({ size = '', loading = false, inner = false }) => {
  if (loading) {
    return inner? (
      // 没有size属性，默认用自定义的大小
      <div className={classNames(
        styles['inner-loading-container'],
        {[styles['custom-size']]: !size}
      )}>
        <Spin size={size || 'small'} className={styles.loading} />
      </div>
    ): (
      createPortal(
        <div className={styles['loading-container']}>
          <Spin className={styles.loading} />
        </div>,
        document.querySelector('body'),
      )
    );
  }
  return null;
};

Loading.propTypes = {
  size: PropTypes.string,
  loading: PropTypes.bool,
  inner: PropTypes.bool
};

export default Loading;

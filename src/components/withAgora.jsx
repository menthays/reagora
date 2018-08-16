// import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Context from './AgoraContext';

function withAgora(WrappedComponent) {
  return class extends Component {
    render() {
      return (
        <Context.Consumer>
          {({ ...context }) => {
            if (context.readyState) {
              return (<WrappedComponent {...this.props} { ...context } />)
            } else {
              return null
            }
          }}
        </Context.Consumer>
      )
    }
  };
}

// withModal.propTypes = {
//   active: PropTypes.bool,
//   mask: PropTypes.bool
// };

export default withAgora;

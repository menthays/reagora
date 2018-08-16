import React, { Component } from 'react';

import Reagora from './components/Reagora';
import withAgora from './components/withAgora';
import logo from './logo.svg';
import './App.css';

class Mine extends Component {
  componentDidMount() {
    this.props.localStream && this.props.localStream.play('minemine')
  }

  componentWillUnmount() {
    this.props.localStream && this.props.localStream.stop()
  }

  render() {
    return (
      <div id='minemine' style={{width:'400px', height:'300px'}}></div>
    )
  }
}

const WithAgoraMine = withAgora(Mine)

class App extends Component {
  render() {
    return (
      <Reagora appId='ed4e1ba42731406c8a1a42b424605f8a' channel='cczcyy' audio={1} video={1} shareId={2}>
        <WithAgoraMine />
      </Reagora>
    );
  }
}

export default App;

import React, { Component } from 'react';

import Reagora from './components/Reagora';
import withAgora from './components/withAgora';
import StreamPlayer from './components/StreamPlayer';
import logo from './logo.svg';
import './App.css';

class Mine extends Component {
  render() {
    return (
      <StreamPlayer stream={this.props.localStream} width={240} height={180} showStreamStatus={true} showVolume={true}></StreamPlayer>
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

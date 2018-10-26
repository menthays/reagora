import PropTypes from 'prop-types';
import React from 'react';


class StreamPlayer extends React.Component {
  constructor(props) {
    super(props);
    this._domId = `reagora-player-${props.stream && props.stream.getId()}`
    this.state= {
      streamStatus: {},
      audioLevel: 0
    }
  }

  static Mask = (<div style={
    {fontSize: 'xx-large', zIndex: '2', backgroundColor: 'lightgrey', width: '100%', height: '100%', position:'absolute', display: 'flex', justifyContent: 'center', alignItems: 'center'}
  }>?</div>)

  static StreamStatus = (status, audioLevel) => (
    <div style={
      {fontSize: 'xx-small', overflow: 'auto', zIndex: '3', backgroundColor: 'rgba(0, 0, 0, .3)', color: 'rgba(85, 249, 100, .8)', width: '100%', height: '100%', position:'absolute', boxSizing: 'border-box', padding: '6px 10px'}
    }>
      { 
        Object.entries(status).map(item => {
          return (
            <p>{`${item[0]}: ${item[1]}`}</p>
          )
        }) 
      }
      {
        audioLevel ? (<p>{`audioLevel: ${audioLevel}`}</p>) : null
      }
    </div>
  )

  _addDetector = () => {
    this.statusDetector = setInterval(() => {
      if ( this.props.showStreamStatus ) {
        try {
          this.props.stream.getStats(e => {
            this.setState({
              streamStatus: e
            }); 
          });
        } catch (err) {
          console.warn(err);
        }
      }
    }, 1500);

    this.audioDetector = setInterval(() => {
      if (this.props.showVolume) {
        try {
          this.setState({
            audioLevel: this.props.stream.getAudioLevel()*100
          });
        } catch (err) {
          console.warn(err);
        }
      }
    }, 1500);
  }

  componentDidMount() {
    try {
      this.props.stream.play(this._domId);
      this._addDetector()
    } catch (err) {
      // tbd
    }
  }

  componentWillUnmount() {
    try {
      this.props.stream.stop();
      clearInterval(this.statusDetector)
    } catch (err) {
      // tbd
    }
  }

  render() {
    // get style
    let style = this.props.style || {
      position: 'relative'
    };
    if(this.props.width) {
      style.width = `${this.props.width}px`
    };
    if(this.props.height) {
      style.height = `${this.props.height}px`
    }

    // get class
    let className = this.props.className || ''

    return (
      <div id={this._domId} className={className} style={style}>
        {this.props.mask ? StreamPlayer.Mask : null}
        {this.props.showStreamStatus ? StreamPlayer.StreamStatus(this.state.streamStatus, this.state.audioLevel) : null}
      </div>
    )
  }
}


StreamPlayer.propTypes = {
  stream: PropTypes.object,
  width: PropTypes.number,
  height: PropTypes.number,
  mask: PropTypes.bool,
  showStreamStatus: PropTypes.bool,
  showVolume: PropTypes.bool,
  // showToolbar: PropTypes.bool
}

export default StreamPlayer;
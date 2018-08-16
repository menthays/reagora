import AgoraRTC from 'agora-rtc-sdk';
import React from 'react';
import { List } from 'immutable';

import Context from './AgoraContext';

class Reagora extends React.Component {
  constructor(props) {
    super(props);
    this.rtcEngine = AgoraRTC;
    this.client = undefined;
    // this.subClient = undefined;
    this.readyState = false;
    this.readyState2 = false;
    this.remoteStreamList = new List();
    this.state = {
      localStream: undefined,
      // shareStream: undefined,
      remoteStreams: []
    };
    this._initialize()
  }


  _initClient = () => {
    return new Promise((resolve, reject) => {
      let {
        appId, channel, streamId, token
      } = this.props;
      let config = this.props.clientConfig || {
        mode: 'live',
        codec: 'h264'
      };
      this.client = AgoraRTC.createClient(config);
      this.client.init(appId, () => {
        this.client.join(token, channel, streamId, resStreamId => {
          resolve(resStreamId)
        }, err => {
          reject(err)
        })
      }, err => {
        reject(err)
      })
    })
  }

  // _initSubClient = () => {
  //   return new Promise((resolve, reject) => {
  //     let {
  //       appId, channel, shareId, token
  //     } = this.props;
  //     this.subClient = AgoraRTC.createClient(this.props.clientConfig);
  //     this.subClient.init(appId, () => {
  //       this.subClient.join(token, channel, shareId, resStreamId => {
  //         resolve()
  //       }, err => {
  //         reject(err)
  //       })
  //     }, err => {
  //       reject(err)
  //     })
  //   })
  // }

  _initStream = (streamId) => {
    return new Promise((resolve, reject) => {
      let stream = AgoraRTC.createStream({
        video: this.props.video,
        audio: this.props.audio,
        streamID: streamId,
        screen: false
      });
      stream.setVideoProfile(this.props.videoProfile);
      stream.init(() => {
        resolve(stream);
      }, err => {
        reject(err);
      })
    });
  };

  _initialize = () => {
    return new Promise((resolve, reject) => {
      let promises = [];
      promises.push(this._initClient());
      // promises.push(this._initSubClient());
      Promise.all(promises).then(([resStreamId]) => {
        this._initStream(resStreamId).then(stream => {
          if (this.props.video || this.props.audio) {
            this.client.publish(stream, err => {
              reject(err)
            });
            setTimeout(() => {
              if (this.state.readyState) {
                this.setState({
                  localStream: stream
                });
              } else {
                this._subscriveClientEvents()
                this._cacheStream = stream;
              }
              this.setState({
                readyState2: true
              })
              resolve()
            }, 300);
          }
        }).catch(err => {
          reject(err);
        });
      }).catch(err => {
        reject(err);
      })
    })
  };

  _subscriveClientEvents = () => {
    let rtc = this.client;

    rtc.on('stream-added', evt => {
      let stream = evt.stream;
      let streamId = stream.getId();
      console.log(
        `Add Stream ${streamId} at ${new Date().toLocaleTimeString()}`
      );
      // if (streamId === this.props.shareId) {
      //   // if share from local, do not sub
      //   return;
      // }
      rtc.subscribe(stream, err => {
        console.error('Subscribe stream failed: ' + err);
      });
    });

    rtc.on('stream-subscribed', evt => {
      let stream = evt.stream;
      let streamId = stream.getId();
      console.log(
        `Subscribe stream ${streamId} at ${new Date().toLocaleTimeString()}`
      );
      if (streamId === this.props.shareId) {
        this.setState({
          shareStream: stream
        });
      } else {
        this.remoteStreamList.push(stream);
        this.setState({
          remoteStreams: this.remoteStreamList.toArray()
        });
      }
    });

    rtc.on('peer-leave', evt => {
      let stream = evt.stream;
      if (stream) {
        let streamId = stream.getId();
        console.log(
          `Peer ${streamId} left at ${new Date().toLocaleTimeString()}`
        );
        if (streamId === this.props.shareId) {
          this.setState({
            shareStream: undefined
          });
        } else {
          this.remoteStreamList = this.remoteStreamList.filter(item => {
            return item.getId() !== streamId;
          });
          this.setState({
            remoteStreams: this.remoteStreamList
          })
        }
      }
    });

    rtc.on('stream-removed', evt => {
      let stream = evt.stream;
      if (stream) {
        let streamId = stream.getId();
        console.log(
          `Remove stream ${streamId} at ${new Date().toLocaleTimeString()}`
        );
        if (streamId === this.props.shareId) {
          this.setState({
            shareStream: undefined
          });
        } else {
          this.remoteStreamList = this.remoteStreamList.filter(item => {
            return item.getId() !== streamId;
          });
          this.setState({
            remoteStreams: this.remoteStreamList
          })
        }
      }
    });
  }

  // startScreenShare = () => {
  //   return new Promise((resolve, reject) => {
      
  //   })
  // }

  // stopScreenShare = () => {
    
  // }

  componentDidMount() {
    if (this.state.readyState2) {
      this.setState({
        localStream: this._cacheStream
      });
      this._subscriveClientEvents()
    } 
    this.setState({
      readyState: true
    })
  }

  render() {
    return (
      <Context.Provider value={{
        localStream: this.state.localStream,
        remoteStreams: this.state.remoteStreams,
        client: this.client,
        rtcEngine: this.rtcEngine,
        readyState: this.state.readyState && this.state.readyState2
      }}>
        {this.props.children}
      </Context.Provider>
    )
  }
};

export default Reagora;
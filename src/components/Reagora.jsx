import AgoraRTC from 'agora-rtc-sdk';
import React from 'react';

class Reagora extends React.Component {
  constructor(props) {
    super(props);
    this.rtcEngine = AgoraRTC;
    this.client = undefined;
    this.stream = undefined;
    this.client2 = undefined;
    this.readyState = false;
    this.readyState2 = false;
    this.state = {
      localClient: {},
      localStream: {}
    };
  }


  _initClient = () => {
    return new Promise((resolve, reject) => {
      let {
        appId, channel, streamId, token
      } = this.props;
      this.client = AgoraRTC.createClient(this.props.clientConfig);
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
  };

  _initStream = (streamId) => {
    return new Promise((resolve, reject) => {
      this.stream = AgoraRTC.createStream({
        video: this.props.video,
        audio: this.props.audio,
        streamID: streamId,
        screen: false
      });
      this.stream.setVideoProfile(this.props.videoProfile);
      this.stream.init(() => {
        resolve();
      }, err => {
        reject(err);
      })
    });
  };

  _initialize = () => {
    return new Promise((resolve, reject) => {
      this._initClient().then(resStreamId => {
        this._initStream(resStreamId).then(() => {
          if (this.props.video || this.props.audio) {
            this.client.publish(this.stream, err => {
              reject(err)
            });
            setTimeout(() => {
              if (this.readyState) {
                this.setState({
                  localClient: this.client,
                  localStream: this.stream
                });
              } else {
                this.readyState2 = true;
              }
              resolve()
            }, 300);
          }
        }).catch(err => {
          reject(err);
        })
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
      if (this.client2 && streamId === this.props.shareId) {
        // if share from local, do not sub
        return;
      }
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

      };
    });

    rtc.on('peer-leave', evt => {
      let stream = evt.stream;
      if (stream) {
        let streamId = stream.getId();
        console.log(
          `Peer ${streamId} left at ${new Date().toLocaleTimeString()}`
        );
        if (streamId === this.props.shareId) {

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

        }
      }
    });
  }

  componentDidMount() {
    this.readyState = true;
    if (this.readyState2) {
      this.setState({
        localClient: this.client,
        localStream: this.stream
      });
    };
    this._subscriveClientEvents()
  }
};

export default Reagora;
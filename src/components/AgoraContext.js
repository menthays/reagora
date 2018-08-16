import { createContext } from 'react';

const initialState = {
  localStream: undefined,
  remoteStreams: [],
};

const context = createContext(initialState);

export default context;

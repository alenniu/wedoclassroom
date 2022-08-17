import './App.css';
import { Provider } from 'react-redux';
import Routing from './Routing';
import Loading from './Pages/Loading';
import { store } from './Reducers';
import { useEffect } from 'react';
import { TOGGLE_NAV } from './Actions/types';
import config from "./Config";
import io from "socket.io-client"
import { SocketProvider } from './Context/SocketContext';
import { SOCKET_EVENT_APP_CONFIG, SOCKET_EVENT_LOGIN } from 'my-server/socket_events';
import { set_config } from './Actions';

const {is_window, backend_url} = config;
let socket = null;

if(is_window){
  socket = io(backend_url, {
      timeout: 10000,
      jsonp: false,
      transports: ["websocket"],
      autoConnect: false
  });

  window.MyVars = window.MyVars || {};
  window.MyVars.socket = socket;
  
  socket.on("connect", function(){
    const {Auth: {logged_in=false}, App: {user=null}} = store.getState()
    console.log("Websocket connected ⚡⚡⚡");
    if(logged_in && user){
      socket.emit(SOCKET_EVENT_LOGIN, user);
    }
  });

  socket.on(SOCKET_EVENT_APP_CONFIG, (app_config) => {
    store.dispatch(set_config(app_config));
  })
}

function App() {

  const onKeyPress = (e:KeyboardEvent) => {
    switch(e.key){
      case "[":{
        const {activeElement} = document;
        if(activeElement.tagName !== "INPUT" && activeElement.tagName !== "TEXTAREA" && activeElement.tagName !== "SELECT"){
          store.dispatch({type: TOGGLE_NAV});
        }
      }
      break;

      default:
        // console.log(e.key);
    }
  }

  useEffect(() => {
    socket?.connect();
    window.addEventListener("keypress", onKeyPress);

    return () => {
      socket?.disconnect();
      window.removeEventListener("keypress", onKeyPress);
    }
  }, []);

  return (
    <Provider store={store}>
      <SocketProvider default_value={socket}>
        <div className="App">
          {/* <header className="App-header">
          </header> */}

          <Routing />
          <Loading />
        </div>
      </SocketProvider>
    </Provider>
  );
}

export default App;

import './App.css';
import { Provider } from 'react-redux';
import Routing from './Routing';
import Loading from './Pages/Loading';
import { store } from './Reducers';
import { useEffect } from 'react';
import { TOGGLE_NAV } from './Actions/types';
import config from "./Config";
import io from "socket.io-client"

const {is_window, backend_url} = config;

if(is_window){
  var socket = io(backend_url, {
      timeout: 10000,
      jsonp: false,
      transports: ["websocket"],
  });

  window.MyVars = window.MyVars || {};
  window.MyVars.socket = socket;
  
  socket.on("connect", function(){
    console.log("sockets connected to server.");
  });
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
    window.addEventListener("keypress", onKeyPress);

    return () => {
      window.removeEventListener("keypress", onKeyPress);
    }
  }, []);

  return (
    <Provider store={store}>
      <div className="App">
        {/* <header className="App-header">
        </header> */}

        <Routing />
        <Loading />
      </div>
    </Provider>
  );
}

export default App;

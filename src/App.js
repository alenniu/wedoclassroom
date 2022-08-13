import './App.css';
import { Provider } from 'react-redux';
import Routing from './Routing';
import Loading from './Pages/Loading';
import { store } from './Reducers';
import { useEffect } from 'react';
import { TOGGLE_NAV } from './Actions/types';

function App() {

  const onKeyPress = (e:KeyboardEvent) => {
    switch(e.key){
      case "[":
        store.dispatch({type: TOGGLE_NAV});
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

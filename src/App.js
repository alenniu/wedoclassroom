import './App.css';
import { Provider } from 'react-redux';
import Routing from './Routing';
import Loading from './Pages/Loading';
import { store } from './Reducers';

function App() {
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

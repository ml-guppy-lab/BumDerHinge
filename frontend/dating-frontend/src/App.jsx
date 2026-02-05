// import './App.css'
// import IPhoneFrame from "./components/IPhoneFrame";
// import 'bootstrap/dist/css/bootstrap.min.css';

// function App() {
//   return (
//     <div className="app-background">
//         <IPhoneFrame />
//     </div>
//   );
// }

// export default App;

import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import HomePage from './components/HomePage';
import IPhoneFrame from './components/IPhoneFrame';

function App() {
  return (
    <Router>
      <div className="app-background min-vh-100">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/swipe" element={<IPhoneFrame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
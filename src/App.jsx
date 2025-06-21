import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import Login from './componants/login';
// import Register from './componants/auth/Register';
import Layout from './utils/layout';
 
import Msg from './componants/chat';
import PrivateChat from './componants/privateChat/PrivateChat';
import Register from './componants/Register';
import Login from './componants/login';
import Message from './componants/message';
import '@fortawesome/fontawesome-free/css/all.min.css';

// import Login from './componants/auth/login';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
 
        <Route path="/home" element={<Layout />}>
 
          <Route path="chat" element={<Msg />} />
      
          <Route path="private-chat/:receiverEmail" element={<PrivateChat />} />
           <Route path="chat/:conversationId" element={<Message />} />
         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

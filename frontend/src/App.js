import React, { useState } from 'react';
import './App.css';
import Navbar from './components/navbar';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import Profile from './components/profile';
import Home from './components/home';
import CreatePost from './components/Createpost';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { LoginContext } from './context/loginContext';
import Notify from './components/Notification';
import Modal from './components/Modal';
import UserProfile from './components/UserProfile';
import MyFollowingPost from './components/MyFollowingPost';
import Search from './components/Search';
import Message from './components/Message';

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <LoginContext.Provider value={{ setUserLogin, setModalOpen }}>
          <Navbar login={userLogin} />
          <Routes>
            <Route path='/' element={<Home />} />
            <Route path='/signup' element={<SignUp />} />
            <Route path='/signin' element={<SignIn />} />
            <Route path='/profile' element={<Profile />} />
            <Route exact path="/Message" component={Message}  element={<Message/>}/>
            <Route path="/Message/:conversationId" component={Message} element={<Message/>}/>
            <Route path='/notification' element={<Notify />} />
            <Route path='/followingpost' element={<MyFollowingPost />} />
            <Route path='/profile/:userid' element={<UserProfile />} />
            <Route path='/createPost' element={<CreatePost />} />
            <Route path='/search' element={<Search />} />
          </Routes>
          <ToastContainer />
          {modalOpen && <Modal setModalOpen={setModalOpen} />}
        </LoginContext.Provider>
      </div>
    </BrowserRouter>
  );
}

export default App;
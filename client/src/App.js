import { useState, useEffect } from 'react';
import './App.css';
import io from 'socket.io-client'

const socket = io.connect("http://localhost:5500")


function App() {
  const [message, setMessage] = useState(null)
  const [messageReceived, setMessageReceived] = useState(null)
  
  const sendMessage = ()=>{
    socket.emit("send_message", {message})
  }
  useEffect(() => {
    socket.on("receive_message", (data)=>{
      setMessageReceived(data.message)
    })
  }, [socket])
  return (
    <div className="App">
      <input type="text" placeholder='message.' onChange={(e)=> {setMessage(e.target.value)}} />
      <button onClick={sendMessage}> send a message</button>

      <div>
        <h1>Message</h1>
        {messageReceived}
      </div>
    </div>
  );
}

export default App;

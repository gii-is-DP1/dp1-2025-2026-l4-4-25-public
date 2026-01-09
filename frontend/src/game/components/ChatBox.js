import React, {useRef, useEffect} from 'react';

export default function ChatBox({ 
  message, 
  newMessage, 
  setNewMessage, 
  SendMessage, 
  isSpectator 
}) {
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
      if (chatContainerRef.current && messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ 
          behavior: 'smooth',
          block: 'nearest',
          inline: 'nearest'
        });
      }
    }, [message]);
  return (
    <div className="chat-box">
      <div className="chat-header">TEXT CHAT</div>

      <div className="chat-messages" ref={chatContainerRef}>
        {message.length === 0 ? (
          <p className="no-messages">Not messages yet...</p>
        ) : (
          message.map((msg, index) => (
            <p key={index}>
              <strong>{msg.author}:</strong> {msg.text}
            </p>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form className="chat-input" onSubmit={SendMessage}>
        <input
          type="text"
          disabled={isSpectator}
          placeholder="Write a message📥"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
      </form>
    </div>
  );
}

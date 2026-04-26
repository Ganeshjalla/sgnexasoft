import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { messageAPI } from '../../api/services';
import { Send } from 'lucide-react';
import { format } from 'date-fns';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

export default function Messages() {
  const { user } = useAuth();
  const { userId } = useParams();
  const [partners, setPartners] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    messageAPI.getPartners().then(r => {
      setPartners(r.data);
      if (userId && r.data.length) {
        const found = r.data.find(u => u.id === parseInt(userId));
        if (found) setSelectedUser(found);
      }
    }).catch(() => {});

    // Connect WebSocket
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      onConnect: () => {
        client.subscribe(`/user/${user.userId}/queue/messages`, (msg) => {
          const data = JSON.parse(msg.body);
          setMessages(prev => [...prev, { ...data, sentAt: new Date().toISOString(), sender: { id: data.senderId, name: data.senderName } }]);
        });
      },
    });
    client.activate();
    setStompClient(client);
    return () => client.deactivate();
  }, [user]);

  useEffect(() => {
    if (selectedUser) {
      messageAPI.getConversation(selectedUser.id).then(r => setMessages(r.data)).catch(() => {});
    }
  }, [selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !selectedUser) return;
    setSending(true);
    try {
      if (stompClient?.connected) {
        stompClient.publish({
          destination: '/app/chat.send',
          body: JSON.stringify({ senderId: user.userId, receiverId: selectedUser.id, content: newMsg, senderName: user.name })
        });
      } else {
        await messageAPI.send({ receiverId: selectedUser.id, content: newMsg });
      }
      setMessages(prev => [...prev, { id: Date.now(), sender: { id: user.userId, name: user.name }, receiver: { id: selectedUser.id }, content: newMsg, sentAt: new Date().toISOString(), isRead: false }]);
      setNewMsg('');
    } catch (e) {}
    setSending(false);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-0 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Partner list */}
      <div className="w-72 border-r border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Messages</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {partners.length === 0 && (
            <div className="p-8 text-center text-gray-400 text-sm">No conversations yet</div>
          )}
          {partners.map(p => (
            <button key={p.id} onClick={() => setSelectedUser(p)}
              className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-left transition-colors ${selectedUser?.id === p.id ? 'bg-indigo-50' : ''}`}>
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold flex-shrink-0">
                {p.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-gray-800 text-sm truncate">{p.name}</p>
                <p className="text-xs text-gray-400 truncate">{p.role}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {selectedUser ? (
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-semibold">
              {selectedUser.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{selectedUser.name}</p>
              <p className="text-xs text-gray-400">{selectedUser.role}</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map(m => {
              const mine = m.sender?.id === user.userId;
              return (
                <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${mine ? 'bg-indigo-600 text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                    <p>{m.content}</p>
                    <p className={`text-xs mt-1 ${mine ? 'text-indigo-200' : 'text-gray-400'}`}>
                      {m.sentAt ? format(new Date(m.sentAt), 'HH:mm') : ''}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <input className="flex-1 input" placeholder="Type a message..."
              value={newMsg} onChange={e => setNewMsg(e.target.value)} />
            <button type="submit" disabled={sending || !newMsg.trim()} className="btn-primary px-4 disabled:opacity-60">
              <Send size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center text-center">
          <div>
            <p className="text-5xl mb-4">💬</p>
            <p className="text-gray-500 font-medium">Select a conversation</p>
            <p className="text-gray-400 text-sm mt-1">Choose a chat partner from the left</p>
          </div>
        </div>
      )}
    </div>
  );
}

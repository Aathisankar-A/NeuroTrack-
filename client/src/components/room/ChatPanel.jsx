import React, { useState, useEffect, useRef } from 'react';
import { Send, Smile, Paperclip, Code, Loader2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import useAuth from '../../hooks/useAuth';

const ChatPanel = ({ roomId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typingUser, setTypingUser] = useState(null);
    const socket = useSocket();
    const { user } = useAuth();
    const scrollRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (message) => {
            setMessages((prev) => [...prev, message]);
            if (typingUser === message.sender.name) {
                setTypingUser(null);
            }
        };

        const handleTyping = ({ name }) => {
            if (name !== user?.name) {
                setTypingUser(name);
                if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingUser(null);
                }, 3000);
            }
        };

        socket.on('chat:message:received', handleNewMessage);
        socket.on('chat:typing:received', handleTyping);

        return () => {
            socket.off('chat:message:received', handleNewMessage);
            socket.off('chat:typing:received', handleTyping);
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [socket, user, typingUser]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, typingUser]);

    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (socket && roomId && user) {
            socket.emit('chat:typing', { roomId, name: user.name || 'Anonymous' });
        }
    };

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket || !user) return;

        const messageData = {
            roomId,
            sender: {
                _id: user.id,
                name: user.name || 'Anonymous',
            },
            content: input,
            type: 'text',
            createdAt: new Date().toISOString(),
        };

        socket.emit('chat:message', messageData);
        setInput('');
    };

    return (
        <div className="flex flex-col h-full bg-white dark:bg-[#121212] rounded-xl border border-gray-200 dark:border-[#2A2A2A] overflow-hidden">
            <div className="p-4 border-b border-gray-100 dark:border-[#2A2A2A] bg-gray-50 dark:bg-[#1E1E1E]">
                <h3 className="font-bold text-gray-900 dark:text-[#E5E5E5]">Room Chat</h3>
            </div>
            
            <div 
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar"
            >
                {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400 dark:text-[#9CA3AF] text-sm text-center px-4">
                        Say hi to your study partners! <br/> Share links, notes, or ask for help.
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.sender._id === user?.id;
                        return (
                            <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl px-4 py-2 break-words ${
                                    isMe 
                                        ? 'bg-primary-600 text-white rounded-br-sm' 
                                        : 'bg-gray-100 dark:bg-[#1E1E1E] text-gray-900 dark:text-[#E5E5E5] rounded-bl-sm border border-gray-200 dark:border-[#2A2A2A]'
                                }`}>
                                    {!isMe && <p className="text-[10px] font-bold opacity-60 mb-1">{msg.sender.name}</p>}
                                    <p className="text-sm leading-relaxed">{msg.content}</p>
                                </div>
                            </div>
                        );
                    })
                )}
                
                {typingUser && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] rounded-2xl px-4 py-2 bg-gray-50 dark:bg-[#1E1E1E] text-gray-500 text-xs italic flex items-center gap-2 border border-transparent">
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                            <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                            <span className="ml-1">{typingUser} is typing...</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-3 bg-gray-50 dark:bg-[#1E1E1E] border-t border-gray-200 dark:border-[#2A2A2A]">
                <form onSubmit={sendMessage} className="flex items-end gap-2 max-w-full">
                    <button type="button" className="p-2 mb-1 shrink-0 text-gray-400 hover:text-primary-500 transition-colors rounded-lg hover:bg-gray-200 dark:hover:bg-[#2A2A2A]" title="Insert Code Snippet">
                        <Code size={18} />
                    </button>
                    <textarea
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                sendMessage(e);
                            }
                        }}
                        placeholder="Type a message..."
                        className="flex-1 min-w-0 bg-white dark:bg-[#121212] border border-gray-200 dark:border-[#2A2A2A] rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary-500 text-gray-900 dark:text-white resize-none max-h-32 custom-scrollbar"
                        rows="1"
                        style={{ height: input.split('\n').length > 1 ? 'auto' : '38px', minHeight: '38px' }}
                    />
                    <button 
                        type="submit" 
                        disabled={!input.trim()}
                        className="p-2 mb-1 shrink-0 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChatPanel;

import React, { useState, useEffect, useRef } from 'react';
import { Message } from './types';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import TypingIndicator from './components/TypingIndicator';
import { getWebhookResponse } from './services/geminiService';

const ButterflyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white/80">
        <path d="M12.313 3.11a.75.75 0 01.95 1.228 6.002 6.002 0 00-2.028 4.312 7.501 7.501 0 015.163 3.642.75.75 0 01-1.242.843 6 6 0 00-4.148-2.887 6.012 6.012 0 00-2.072 7.424.75.75 0 01-1.341.67A7.515 7.515 0 016.75 10.5a7.5 7.5 0 015.563-7.39zm3.626 15.218a.75.75 0 01-1.242-.843 6 6 0 00-4.148-2.887 6.012 6.012 0 00-2.072-7.424.75.75 0 01-1.341-.67A7.515 7.515 0 016.75 13.5a7.5 7.5 0 015.563 7.39 7.492 7.492 0 01-.874-1.242z" />
        <path d="M21 12.75a.75.75 0 00-1.242-.843 6.002 6.002 0 01-4.148 2.887 6.012 6.012 0 01-2.072-7.424.75.75 0 00-1.341-.67A7.515 7.515 0 009.75 10.5a7.5 7.5 0 00-5.563 7.39c.146.945.45 1.843.874 2.648a.75.75 0 001.242-.843A6 6 0 0110.45 14.8c1.32-.423 2.747-.116 3.868 1.005a6.002 6.002 0 012.028 4.312.75.75 0 00.95 1.228 7.5 7.5 0 00-5.563-7.39z" />
    </svg>
);


const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add an initial greeting message from the model.
    setMessages([{ id: 'init', text: "Hello! I'm the Butterfly Assistant. How can I help you today?", sender: 'model' }]);
  }, []);

  useEffect(() => {
    // Automatically scroll to the latest message.
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = { id: Date.now().toString(), text, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const responseText = await getWebhookResponse(text);
      const modelMessage: Message = { id: (Date.now() + 1).toString(), text: responseText, sender: 'model' };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error getting response:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, something went wrong while connecting to the server. Please try again.',
        sender: 'model'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white font-sans">
      <header className="p-4 shadow-md z-10 bg-black/20 backdrop-blur-sm">
        <div className="flex items-center justify-center space-x-3 max-w-3xl mx-auto">
            <ButterflyIcon />
            <h1 className="text-xl font-bold">Butterfly Assistant</h1>
        </div>
      </header>
      <main ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        {isLoading && (
            <div className="flex justify-start">
                <TypingIndicator />
            </div>
        )}
      </main>
      <ChatInput onSendMessage={handleSendMessage} isLoading={isLoading} />
    </div>
  );
};

export default App;

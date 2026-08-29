import React, { useState } from 'react';
import { FaRobot, FaPaperPlane, FaBook } from 'react-icons/fa';

import Loader from '../../components/common/Loader';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { api } from '../../services/api';

export const AIAssistant = () => {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const askQuestion = async () => {
  if (!question.trim()) return;
  
  const userMessage = { role: 'user', content: question };
  setMessages([...messages, userMessage]);
  setQuestion('');
  setLoading(true);

  try {
    const response = await api.chat({ query: question });
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: response.answer,
      sources: response.sources
    }]);
  } catch (error) {
    console.error('Chat error:', error);
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    }]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FaRobot className="text-4xl text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Wari Heritage Assistant</h1>
          <p className="text-gray-600">Ask anything about Wari traditions, history, and culture</p>
        </div>
      </div>

      <Card className="max-h-[600px] flex flex-col p-4">
        <div className="flex-1 overflow-y-auto max-h-[450px] mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              <FaRobot className="text-5xl text-gray-300 mx-auto mb-4" />
              <p className="text-lg">Try asking:</p>
              <ul className="list-none mt-2 space-y-1">
                <li>What is the history of Wari?</li>
                <li>Tell me about Palkhi tradition</li>
                <li>Who are the key Sants?</li>
              </ul>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`mb-3 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div className={`inline-block p-3 rounded-lg max-w-[80%] ${
                  msg.role === 'user' ? 'bg-primary text-white' : 'bg-gray-100'
                }`}>
                  <strong>{msg.role === 'user' ? 'You' : 'AI Assistant'}:</strong>
                  <p className="mt-1">{msg.content}</p>
                  {msg.sources && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                      <FaBook /> Sources: {msg.sources.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          {loading && <Loader size="sm" />}
        </div>

        <div className="flex gap-3">
          <Input
            placeholder="Ask about Wari heritage..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && askQuestion()}
            className="flex-1"
          />
          <Button onClick={askQuestion} disabled={loading} className="flex items-center gap-2">
            <FaPaperPlane /> Ask
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default AIAssistant;
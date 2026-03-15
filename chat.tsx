'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const exampleQuestions = [
  "Какие федеральные законы составляют правовую основу стратегии?",
  "Что такое искусственный интеллект по определению стратегии?",
  "Что такое большие фундаментальные модели?",
  "Какие цели развития ИИ указаны в стратегии?",
  "Что такое доверенные технологии?",
  "Какие принципы развития ИИ?"
];

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);
    setShowExamples(false);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: userMessage }] })
      });

      const data = await response.json();
      const assistantMessage = data.choices[0].delta.content;
      
      setMessages(prev => [...prev, { role: 'assistant', content: assistantMessage }]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (question: string) => {
    setInput(question);
    setShowExamples(false);
  };

  return (
    <div className="flex flex-col h-[600px] md:h-[700px] border rounded-lg bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && showExamples && (
          <Card className="p-4">
            <h3 className="font-medium mb-3">Примеры вопросов:</h3>
            <div className="flex flex-wrap gap-2">
              {exampleQuestions.map((q, i) => (
                <Button
                  key={i}
                  variant="outline"
                  size="sm"
                  onClick={() => handleExampleClick(q)}
                  className="text-xs md:text-sm"
                >
                  {q.length > 40 ? q.substring(0, 40) + '...' : q}
                </Button>
              ))}
            </div>
          </Card>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.role === 'assistant' ? (
              <div className="max-w-[80%] bg-blue-50 border-l-4 border-blue-500 p-3 rounded-lg">
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
              </div>
            ) : (
              <div className="max-w-[80%] bg-blue-500 text-white p-3 rounded-lg">
                {message.content}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 p-3 rounded-lg">
              <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Задайте вопрос..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button type="submit" disabled={isLoading}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

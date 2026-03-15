'use client';

import { useState } from 'react';
import { Chat } from '@/components/chat';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24">
      <div className="max-w-4xl w-full">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-4 text-blue-600">
          🇷🇺 Национальная стратегия развития ИИ
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Чат на основе официального документа (с изменениями 2024 г.)
        </p>
        <Chat />
      </div>
    </main>
  );
}

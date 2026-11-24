import React from 'react';
import { Bot } from 'lucide-react';

export const MessageLoading = () => {
  return (
    <div className="flex items-center gap-2 p-4 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200">
      <Bot className="w-4 h-4 text-orange-500 animate-pulse" />
      <span>Processing...</span>
    </div>
  );
};

export const MessageLoadingDemo = () => {
  return (
    <div className="block">
      <MessageLoading />
    </div>
  );
};

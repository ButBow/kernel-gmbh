import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/components/chat/ChatMessage';
import { useAnalytics } from '@/contexts/AnalyticsContext';

interface ChatResponse {
  response: string;
  error?: string;
}

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackEvent, isTrackingTypeEnabled } = useAnalytics();
  const sessionTracked = useRef(false);

  // Track chat session when first message is sent
  useEffect(() => {
    if (messages.length > 0 && !sessionTracked.current) {
      if (isTrackingTypeEnabled('chat_session')) {
        trackEvent('chat_session', window.location.pathname, {
          startTime: new Date().toISOString()
        });
        sessionTracked.current = true;
      }
    }
  }, [messages.length, trackEvent, isTrackingTypeEnabled]);

  const sendMessage = useCallback(async (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Track chat message if consent given
    if (isTrackingTypeEnabled('chat_message')) {
      // Store first 100 chars of message for analytics (privacy)
      const truncatedMessage = content.length > 100 ? content.substring(0, 100) + '...' : content;
      trackEvent('chat_message', window.location.pathname, {
        message: truncatedMessage,
        messageLength: content.length
      });
    }

    try {
      // Prepare conversation history for context
      const conversationHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      // Add current message
      conversationHistory.push({ role: 'user', content });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: content,
          history: conversationHistory.slice(-10), // Last 10 messages for context
        }),
      });

      if (!response.ok) {
        throw new Error('Verbindungsfehler zum Chat-Server');
      }

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Add assistant response
      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: error instanceof Error 
          ? `Es tut mir leid, es gab ein Problem: ${error.message}. Bitte versuchen Sie es später erneut oder kontaktieren Sie uns direkt.`
          : 'Es tut mir leid, ich konnte keine Verbindung herstellen. Bitte versuchen Sie es später erneut.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, trackEvent, isTrackingTypeEnabled]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionTracked.current = false;
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

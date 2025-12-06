import { useState, useCallback, useRef, useEffect } from 'react';
import { Message } from '@/components/chat/ChatMessage';
import { useAnalytics } from '@/contexts/AnalyticsContext';
import { useContent } from '@/contexts/ContentContext';

interface ChatResponse {
  response: string;
  session_id?: string;
  error?: string;
  hint?: string;
}

// Chatbot-Server URLs (Python Backend)
const CHATBOT_URLS = {
  // Versuche zuerst den Python-Server
  python: '/api/python-chat',
  // Fallback auf Node.js Server
  node: '/api/chat',
};

export function useChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { trackEvent, isTrackingTypeEnabled } = useAnalytics();
  const { settings } = useContent();
  const sessionTracked = useRef(false);
  // Session-ID für Python-Backend (wird bei Page-Reload zurückgesetzt)
  const sessionIdRef = useRef<string | null>(null);

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

  // Generiere API-URL - immer über den Node.js Proxy
  const getChatApiUrl = useCallback(() => {
    // Immer den Proxy verwenden, da localhost auf dem Client nicht funktioniert
    const baseUrl = settings.apiBaseUrl?.replace(/\/$/, '') || '';
    return `${baseUrl}/api/python-chat`;
  }, [settings.apiBaseUrl]);

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
      const chatApiUrl = getChatApiUrl();
      
      // Headers mit Session-ID für Kontext-Beibehaltung
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (sessionIdRef.current) {
        headers['X-Session-ID'] = sessionIdRef.current;
      }

      const response = await fetch(chatApiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message: content,
          session_id: sessionIdRef.current,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Verbindungsfehler zum Chat-Server');
      }

      const data: ChatResponse = await response.json();

      if (data.error) {
        throw new Error(data.hint ? `${data.error} - ${data.hint}` : data.error);
      }

      // Speichere Session-ID für nachfolgende Nachrichten
      if (data.session_id) {
        sessionIdRef.current = data.session_id;
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
  }, [messages, trackEvent, isTrackingTypeEnabled, getChatApiUrl]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    sessionTracked.current = false;
    sessionIdRef.current = null; // Reset session on clear
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
}

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Loader2, Bot } from "lucide-react";

const API_URL =  "https://grad-6h2k.onrender.com/";

type Message = {
  id: string;
  text: string;
  sender: "user" | "bot";
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", text: "Hello! How can I help you with your portal applications or portal support today?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scrolls chat to the newest message instantly
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      text: input.trim(),
      sender: "user"
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", 
        body: JSON.stringify({ question: userMessage.text })
      });

      const data = await response.json();
      
      if (!response.ok) throw new Error(data.message || "Failed to get a response.");

      setMessages((prev) => [
        ...prev,
        { id: `bot-${Date.now()}`, text: data.reply, sender: "bot" }
      ]);

    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { id: `error-${Date.now()}`, text: "Sorry, I am having trouble connecting to my brain right now. Try again shortly.", sender: "bot" }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-orange-600 text-white shadow-xl hover:bg-orange-700 transition-all transform hover:scale-105"
        >
          <MessageSquare className="h-6 w-6" />
        </button>
      )}


      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[360px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          <div className="bg-slate-900 px-4 py-3 flex justify-between items-center text-white">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-orange-600 rounded-lg">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm">EduStream Assistant</h3>
                <p className="text-xs text-green-400 font-medium">Online & Ready</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                    msg.sender === "user"
                      ? "bg-orange-600 text-white rounded-tr-none"
                      : "bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                </div>
              </div>
            ))}
            
            {/* TYPING LOADER */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-slate-500 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-orange-600" />
                  <span className="text-xs font-medium">Searching guidelines...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form 
            onSubmit={handleSendMessage} 
            className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2"
          >
            <input
              type="text"
              required
              disabled={isTyping}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about document formats, hours, rejections..."
              className="flex-1 min-w-0 bg-slate-100 border border-transparent rounded-xl px-4 py-2.5 text-sm outline-none focus:bg-white focus:border-orange-600 transition-all disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-orange-600 hover:bg-orange-700 text-white p-2.5 rounded-xl transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
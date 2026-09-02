import { useState } from "react";
import axios from "axios";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const sendMessage = async () => {
        if (!message.trim() || loading) return;

        const userMessage = message;

        setMessages(prev => [
            ...prev,
            { sender: "user", text: userMessage }
        ]);

        setMessage("");
        setLoading(true);

        try {
            const response = await axios.post(
                "http://localhost:5000/chat",
                {
                    message: userMessage,
                    history:messages
                }
            );

            setMessages(prev => [
                ...prev,
                { sender: "bot", text: response.data.reply }
            ]);

        } catch (error) {
            console.error(error);

            setMessages(prev => [
                ...prev,
                {
                    sender: "bot",
                    text: "Sorry, something went wrong. Please try again."
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMessage();
        }
    };

    return (
        <div className="chat-container">

            <div className="chat-header">
                <div className="bot-icon">⚕</div>

                <div>
                    <h2>Healthcare Assistant</h2>
                    <span>AI-powered medical assistant</span>
                </div>
            </div>

            <div className="chat-messages">

                {messages.length === 0 && (
                    <div className="welcome">
                        <h3>👋 Hello!</h3>
                        <p>
                            I can help you with hospital information
                            and general healthcare questions.
                        </p>
                    </div>
                )}

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${
                            msg.sender === "user"
                                ? "user-message"
                                : "bot-message"
                        }`}
                    >
                        {msg.sender === "bot" ? (
                            <ReactMarkdown>
                                {msg.text}
                            </ReactMarkdown>
                        ) : (
                            msg.text
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="message bot-message">
                        Thinking...
                    </div>
                )}

            </div>

            <div className="chat-input-area">

                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask a healthcare question..."
                    disabled={loading}
                />

                <button
                    onClick={sendMessage}
                    disabled={loading || !message.trim()}
                >
                    ➤
                </button>

            </div>

            <div className="disclaimer">
                ⚠️ This chatbot provides general information and
                is not a substitute for professional medical advice.
            </div>

        </div>
    );
}

export default App;
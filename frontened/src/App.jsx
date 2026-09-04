import { useState, useRef } from "react";
import axios from "axios";
import "./App.css";
import { Mic } from "lucide-react";
import ReactMarkdown from "react-markdown";

function App() {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [speakingIndex, setSpeakingIndex] = useState(null);
    const [loading, setLoading] = useState(false);
    const [listening, setListening] = useState(false);

    

    const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognitionRef = useRef(null);

    const startListening = () => {
        if (!SpeechRecognition) {
            alert("Speech Recognition is not supported in this browser.");
            return;
        }
        setListening(true);


        if (!recognitionRef.current) {
            const recognition = new SpeechRecognition();

            recognition.lang = "en-US";
            recognition.continuous = false;
            recognition.interimResults = false;

            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;

                console.log("You said:", transcript);

                setMessage(transcript);
                setListening(false);
                sendMessage(transcript);
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error:", event.error);
            };

            recognition.onend = () => {
                console.log("Speech recognition ended");
                setListening(false);
            };

            recognitionRef.current = recognition;
        }

        recognitionRef.current.start();
    };

    const cleanTextForSpeech = (text) => {
        return text
            .replace(/\*\*(.*?)\*\*/g, "$1") // bold
            .replace(/\*(.*?)\*/g, "$1")     // italic
            .replace(/^[-*+]\s+/gm, "")      // bullet points
            .replace(/^#+\s+/gm, "")         // headings
            .replace(/`([^`]+)`/g, "$1")     // inline code
            .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") // links
            .replace(/\n+/g, ". ")           // new lines
            .trim();
    };

    const speakText = (text,index) => {

         // If this message is already speaking → stop it
        if (speakingIndex === index) {
            window.speechSynthesis.cancel();
            setSpeakingIndex(null);
            return;
        }

        window.speechSynthesis.cancel();

        const cleanText = cleanTextForSpeech(text);

        const voices = window.speechSynthesis.getVoices();

        const susanVoice = voices.find(voice =>
            voice.name.toLowerCase().includes("heera")
        );

        const speech = new SpeechSynthesisUtterance(cleanText);

        if (!susanVoice) {
            alert("Susan voice is not available on this device.");
            return;
        }

        speech.voice = susanVoice;
        speech.lang = "en-IN";
        speech.rate = 1.0;
        speech.pitch = 1.05;

        // Change button to 🔇
        setSpeakingIndex(index);

        // When Susan finishes speaking
        speech.onend = () => {
            setSpeakingIndex(null);
        };

        // If speech is cancelled
        speech.oncancel = () => {
            setSpeakingIndex(null);
        };

        window.speechSynthesis.speak(speech);
    };

   const sendMessage = async (inputMessage = message) => {
        if (!inputMessage.trim() || loading) return;

        const userMessage = inputMessage;

        setMessages(prev => [
            ...prev,
            { sender: "user", text: userMessage }
        ]);

        setMessage("");
        setLoading(true);

        try {

            const updatedHistory = [
                ...messages,
                { sender: "user", text: userMessage }
            ];
            const response = await axios.post(
                "http://localhost:5000/chat",
                {
                    message: userMessage,
                    history: updatedHistory
                }
            );

            const botReply = response.data.reply;

            setMessages(prev => [
                ...prev,
                { sender: "bot", text: botReply }
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
                            <>
                                <ReactMarkdown>
                                    {msg.text}
                                </ReactMarkdown>

                                <button
                                    className="speak-button"
                                    onClick={() => speakText(msg.text,index)}
                                    title={speakingIndex === index ? "Stop speaking" : "Listen"}>
                                    {speakingIndex === index ? "🔇" : "🔊"}
                                </button>
                            </>
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
                    onClick={startListening}
                    className={`mic-button ${listening ? "listening" : ""}`}
                >
                    <Mic size={20} />
                </button>

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
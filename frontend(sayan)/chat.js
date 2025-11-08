const chatBox = document.getElementById("chat-box");
const userInput = document.getElementById("user-input");
const sendBtn = document.getElementById("send-btn");

// Predefined bot responses (simple demo)
const botReplies = [
  { keyword: "hello", reply: "Hi there! How can I assist you with your career today?" },
  { keyword: "career", reply: "There are many paths! What field are you interested in — tech, design, teaching, or management?" },
  { keyword: "quiz", reply: "You can take the career quiz to get personalized guidance!" },
  { keyword: "thanks", reply: "You're most welcome 😊" },
  { keyword: "default", reply: "I'm still learning! Could you please rephrase that?" }
];

// Handle user message
function handleUserMessage() {
  const message = userInput.value.trim();
  if (!message) return;

  // Display user message
  appendMessage("user", message);
  userInput.value = "";

  // Generate bot reply
  setTimeout(() => {
    const botResponse = getBotReply(message);
    appendMessage("bot", botResponse);
  }, 600);
}

// Append message to chat
function appendMessage(sender, text) {
  const msgDiv = document.createElement("div");
  msgDiv.classList.add(sender === "user" ? "user-msg" : "bot-msg");
  msgDiv.textContent = text;
  chatBox.appendChild(msgDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

// Get bot reply from keyword
function getBotReply(message) {
  message = message.toLowerCase();
  for (const item of botReplies) {
    if (message.includes(item.keyword)) return item.reply;
  }
  return botReplies.find(r => r.keyword === "default").reply;
}

// Event listeners
sendBtn.addEventListener("click", handleUserMessage);
userInput.addEventListener("keypress", e => {
  if (e.key === "Enter") handleUserMessage();
});

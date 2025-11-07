document.addEventListener("DOMContentLoaded", () => {
  const chatIcon = document.getElementById("chatIcon");
  const chatbox = document.getElementById("chatbox");
  const chatBody = document.getElementById("chatBody");
  const input = document.getElementById("userInput");

  chatIcon.addEventListener("click", () => {
    chatbox.style.display = chatbox.style.display === "flex" ? "none" : "flex";
  });

  input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
  });

  async function sendMessage() {
    const message = input.value.trim();
    if (!message) return;
    appendMessage("user", message);
    input.value = "";

    appendTyping();

    try {
      const res = await fetch("/get_response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message })
      });
      const data = await res.json();
      removeTyping();
      appendMessage("bot", data.reply);
    } catch (err) {
      removeTyping();
      appendMessage("bot", "⚠️ Connection issue. Try again later.");
    }
  }

  function appendMessage(sender, text) {
    const msg = document.createElement("div");
    msg.className = `chat-msg ${sender}`;
    msg.textContent = text;
    chatBody.appendChild(msg);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function appendTyping() {
    const typing = document.createElement("div");
    typing.className = "chat-msg bot typing";
    typing.innerHTML = "<span>•</span><span>•</span><span>•</span>";
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function removeTyping() {
    const typing = document.querySelector(".typing");
    if (typing) typing.remove();
  }
});

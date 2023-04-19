// Welcome message
console.log("Hello! I'm a chat bot. How can I assist you today?");

// Function to handle user input
function handleUserInput(input) {
  switch (input.toLowerCase()) {
    case "hello":
    case "hi":
      console.log("Hello there!");
      break;
    case "how are you?":
      console.log("I'm a bot, I don't have feelings. But thanks for asking!");
      break;
    case "what's your name?":
      console.log("My name is Chat Bot!");
      break;
    case "what time is it?":
    case "what is the time?":
      console.log(new Date().toLocaleTimeString());
      break;
    case "bye":
      console.log("Goodbye! Have a nice day.");
      break;
    default:
      console.log("I'm sorry, I don't understand what you're saying.");
      break;
  }
}

// Get user input and handle it
const readline = require("readline");
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", (input) => {
  handleUserInput(input);
});

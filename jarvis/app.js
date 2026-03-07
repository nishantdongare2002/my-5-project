const btn = document.querySelector('.talk');
const content = document.querySelector('.content');

// Load UI Sound Effect
// Ensure you have a 'startup.mp3' file in the same folder, or this won't play.
const startSound = new Audio('startup.mp3'); 
startSound.volume = 0.3; 

// Setup British Voice
let voices = [];
window.speechSynthesis.onvoiceschanged = () => {
    voices = window.speechSynthesis.getVoices();
};

function speak(text) {
    const text_speak = new SpeechSynthesisUtterance(text);

    text_speak.rate = 1.05; // Slightly faster for a smart, crisp tone
    text_speak.volume = 1;
    text_speak.pitch = 0.9;

    let jarvisVoice = voices.find(voice => voice.name.includes('Google UK English Male')) || 
                      voices.find(voice => voice.lang === 'en-GB');
    
    if (jarvisVoice) {
        text_speak.voice = jarvisVoice;
    }

    window.speechSynthesis.speak(text_speak);
}

function wishMe() {
    var day = new Date();
    var hour = day.getHours();
    let savedName = localStorage.getItem("bossName") || "Boss"; 

    if (hour >= 0 && hour < 12) {
        speak(`Good Morning ${savedName}. Systems are fully operational.`);
    } else if (hour >= 12 && hour < 17) {
        speak(`Good Afternoon ${savedName}. Ready for instructions.`);
    } else {
        speak(`Good Evening ${savedName}. Awaiting your command.`);
    }
}

let initialized = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.onresult = (event) => {
    const currentIndex = event.resultIndex;
    const transcript = event.results[currentIndex][0].transcript;
    
    // Typewriter effect for the terminal UI
    content.textContent = ""; 
    let i = 0;
    function typeWriter() {
        if (i < transcript.length) {
            content.textContent += transcript.charAt(i);
            i++;
            setTimeout(typeWriter, 40); 
        }
    }
    typeWriter();

    takeCommand(transcript.toLowerCase());
};

btn.addEventListener('click', () => {
    // Attempt to play sound (browsers may block if audio file is missing/corrupted)
    try { startSound.play(); } catch(e) { console.log("Sound skipped."); }

    if (!initialized) {
        speak("Initializing JARVIS interface...");
        wishMe();
        initialized = true;
    }
    
    content.textContent = "LISTENING...";
    recognition.start();
});

function takeCommand(message) {
    // 1. Basic Greetings & Memory
    if (message.includes('hey') || message.includes('hello')) {
        let savedName = localStorage.getItem("bossName") || "Sir";
        speak(`Hello ${savedName}, how may I assist you today?`);
    
    } else if (message.includes("call me")) {
        let name = message.split("call me ")[1]; 
        localStorage.setItem("bossName", name); 
        speak(`Understood. I have updated my databanks. I will call you ${name} from now on.`);

    } else if (message.includes("who am i")) {
        let savedName = localStorage.getItem("bossName") || "Sir"; 
        speak(`You are ${savedName}, the architect of this system.`);

    // 2. Real-Time APIs (No Tabs Opened)
    } else if (message.includes("define")) {
        let word = message.split("define ")[1];
        speak("Accessing dictionary for " + word);
        fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
            .then(response => response.json())
            .then(data => {
                let definition = data[0].meanings[0].definitions[0].definition;
                speak(`The definition is: ${definition}`);
            })
            .catch(error => { speak("I could not find that word in my current database."); });

    } else if (message.includes("tell me a joke")) {
        speak("Accessing humor protocol.");
        fetch('https://v2.jokeapi.dev/joke/Programming?type=single')
            .then(response => response.json())
            .then(data => { speak(data.joke); })
            .catch(error => { speak("My apologies, the humor server is currently offline."); });

    // 3. Custom System Protocols
    } else if (message.includes("launch valorant") || message.includes("gaming mode")) {
        speak("Warming up the GPU and initializing gaming protocol. Good luck out there.");
        window.open("https://playvalorant.com/", "_blank"); 

    } else if (message.includes("play rahgir") || message.includes("play music")) {
        speak("Accessing Spotify. Queuing Rahgir.");
        window.open("https://open.spotify.com/search/rahgir", "_blank");

    } else if (message.includes("movie time")) {
        speak("Scanning for the latest Sci-Fi and Action movies. Bypassing the love stories.");
        window.open("https://www.google.com/search?q=best+latest+sci-fi+action+movies", "_blank");
        
    } else if (message.includes("weather")) {
        speak("Checking current atmospheric conditions for Pune.");
        window.open("https://www.google.com/search?q=weather+in+pune", "_blank");

    // 4. Standard Web Commands
    } else if (message.includes("open google")) {
        window.open("https://google.com", "_blank");
        speak("Opening Google...");
    } else if (message.includes("open youtube")) {
        window.open("https://youtube.com", "_blank");
        speak("Opening Youtube...");
    } else if (message.includes('wikipedia')) {
        window.open(`https://en.wikipedia.org/wiki/${message.replace("wikipedia", "").trim()}`, "_blank");
        speak("This is what I found on Wikipedia.");
    } else if (message.includes('time')) {
        const time = new Date().toLocaleString(undefined, { hour: "numeric", minute: "numeric" });
        speak("The current time is " + time);
    } else if (message.includes('date')) {
        const date = new Date().toLocaleString(undefined, { month: "short", day: "numeric" });
        speak("Today's date is " + date);
    } else if (message.includes('calculator')) {
        window.open('Calculator:///');
        speak("Opening Calculator");
    } else {
        window.open(`https://www.google.com/search?q=${message.replace(" ", "+")}`, "_blank");
        speak("I found some information for " + message + " on Google");
    }
}

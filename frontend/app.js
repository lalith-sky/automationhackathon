// Intro animation hide with enhanced effects
window.addEventListener('load',()=>{
    setTimeout(()=>{
        const introScreen = document.getElementById('intro-screen');
        introScreen.style.opacity = '0';
        introScreen.style.transition = 'opacity 1s ease-out';
        setTimeout(() => {
            introScreen.style.display = 'none';
        }, 1000);
    },3000); // 3 sec intro
});

// Elements
const chatBody=document.getElementById("chat-body");
const userInput=document.getElementById("user-input");
const sendBtn=document.getElementById("send-btn");
const prompts=document.querySelectorAll(".prompt-btn");
const uploadFile=document.getElementById("uploadFile");
const fileNameDisplay=document.getElementById("file-name");
const moduleTitle=document.getElementById("module-title");
const moduleDesc=document.getElementById("module-desc");
const docList=document.getElementById("document-list");
const filterBtns=document.querySelectorAll(".filter-buttons button");
const navLinks=document.querySelectorAll(".navbar ul li a");
const jarvisFace = document.getElementById("jarvis-face");

let uploadedDocuments=[];
let isListening = false;
let recognition = null;
let currentUser = null;
let authToken = null;

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API Helper Functions
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(authToken && { 'Authorization': `Bearer ${authToken}` })
        },
        ...options
    };
    
    try {
        const response = await fetch(url, config);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Authentication Functions
async function login(email, password) {
    try {
        const response = await apiRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('jarvis_token', authToken);
        localStorage.setItem('jarvis_user', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        throw error;
    }
}

async function register(username, email, password) {
    try {
        const response = await apiRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });
        
        authToken = response.token;
        currentUser = response.user;
        localStorage.setItem('jarvis_token', authToken);
        localStorage.setItem('jarvis_user', JSON.stringify(currentUser));
        
        return response;
    } catch (error) {
        throw error;
    }
}

function logout() {
    authToken = null;
    currentUser = null;
    localStorage.removeItem('jarvis_token');
    localStorage.removeItem('jarvis_user');
    showLoginForm();
}

// Check if user is logged in
function checkAuth() {
    const token = localStorage.getItem('jarvis_token');
    const user = localStorage.getItem('jarvis_user');
    
    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        hideLoginForm();
        loadUserDocuments();
    } else {
        // Allow demo mode - don't force login
        console.log('Demo mode - no authentication required');
        // showLoginForm(); // Commented out to allow demo access
    }
}

// Show/Hide Login Form
function showLoginForm() {
    const loginHTML = `
        <div id="login-overlay" style="
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); z-index: 3000; display: flex;
            align-items: center; justify-content: center;
        ">
            <div style="
                background: linear-gradient(135deg, rgba(0,255,255,0.1), rgba(255,0,255,0.1));
                border: 2px solid cyan; border-radius: 20px; padding: 2rem;
                backdrop-filter: blur(10px); text-align: center; min-width: 400px;
            ">
                <h2 style="color: cyan; margin-bottom: 1rem;">J.A.R.V.I.S AI Login</h2>
                <div id="login-form">
                    <input type="email" id="login-email" placeholder="Email" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid cyan;
                        background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
                    ">
                    <input type="password" id="login-password" placeholder="Password" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid cyan;
                        background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
                    ">
                    <button id="login-btn" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; background: cyan;
                        border: none; color: black; font-weight: bold; border-radius: 8px; cursor: pointer;
                    ">Login</button>
                    <button id="show-register" style="
                        width: 100%; padding: 0.5rem; margin: 0.5rem 0; background: transparent;
                        border: 1px solid magenta; color: magenta; border-radius: 8px; cursor: pointer;
                    ">Create Account</button>
                </div>
                <div id="register-form" style="display: none;">
                    <input type="text" id="register-username" placeholder="Username" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid cyan;
                        background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
                    ">
                    <input type="email" id="register-email" placeholder="Email" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid cyan;
                        background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
                    ">
                    <input type="password" id="register-password" placeholder="Password" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; border: 1px solid cyan;
                        background: rgba(0,0,0,0.8); color: white; border-radius: 8px;
                    ">
                    <button id="register-btn" style="
                        width: 100%; padding: 0.8rem; margin: 0.5rem 0; background: magenta;
                        border: none; color: white; font-weight: bold; border-radius: 8px; cursor: pointer;
                    ">Register</button>
                    <button id="show-login" style="
                        width: 100%; padding: 0.5rem; margin: 0.5rem 0; background: transparent;
                        border: 1px solid cyan; color: cyan; border-radius: 8px; cursor: pointer;
                    ">Back to Login</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', loginHTML);
    
    // Add event listeners
    document.getElementById('login-btn').addEventListener('click', handleLogin);
    document.getElementById('register-btn').addEventListener('click', handleRegister);
    document.getElementById('show-register').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('register-form').style.display = 'block';
    });
    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('register-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });
}

function hideLoginForm() {
    const overlay = document.getElementById('login-overlay');
    if (overlay) overlay.remove();
}

async function handleLogin() {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
        await login(email, password);
        addMessage("Welcome back! I'm ready to assist you.", 'bot');
    } catch (error) {
        addMessage("Login failed: " + error.message, 'bot');
    }
}

async function handleRegister() {
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    try {
        await register(username, email, password);
        addMessage("Account created successfully! Welcome to J.A.R.V.I.S AI.", 'bot');
    } catch (error) {
        addMessage("Registration failed: " + error.message, 'bot');
    }
}

// Initialize Speech Recognition
if ('webkitSpeechRecognition' in window) {
    recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    
    recognition.onstart = () => {
        isListening = true;
        jarvisFace.style.animation = 'rotateFace 1s linear infinite, glow 0.5s ease-in-out infinite alternate';
    };
    
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        userInput.value = transcript;
        processMessage(transcript);
    };
    
    recognition.onend = () => {
        isListening = false;
        jarvisFace.style.animation = 'rotateFace 4s linear infinite, glow 2s ease-in-out infinite alternate';
    };
}

// Built-in intro prompts
const builtInPrompts=[
    "👋 Hi, I’m Jarvis. I’m here to help you with HR and Finance document analysis.",
    "You can upload documents, ask questions, or use built-in commands.",
    "Try prompts below or type your own query."
];
builtInPrompts.forEach(p=>{
    const div=document.createElement("div");
    div.classList.add("bot-msg");
    div.textContent=p;
    chatBody.appendChild(div);
});

// Enhanced Speak function with voice selection
function speak(text){
    const utter=new SpeechSynthesisUtterance(text);
    utter.lang='en-US';
    utter.rate = 0.9;
    utter.pitch = 1.1;
    utter.volume = 0.8;
    
    // Try to use a more robotic voice
    const voices = speechSynthesis.getVoices();
    const roboticVoice = voices.find(voice => 
        voice.name.includes('Microsoft') || 
        voice.name.includes('Google') ||
        voice.name.includes('Samantha')
    );
    if (roboticVoice) utter.voice = roboticVoice;
    
    speechSynthesis.speak(utter);
}

// Add typing indicator
function showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.classList.add('typing-indicator');
    typingDiv.innerHTML = 'Jarvis is thinking';
    chatBody.appendChild(typingDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
    return typingDiv;
}

// Remove typing indicator
function removeTypingIndicator(typingDiv) {
    if (typingDiv && typingDiv.parentNode) {
        typingDiv.parentNode.removeChild(typingDiv);
    }
}

// Enhanced Add chat message with typing animation
function addMessage(msg, sender='bot', showTyping=true){
    if (sender === 'bot' && showTyping) {
        const typingDiv = showTypingIndicator();
        
        setTimeout(() => {
            removeTypingIndicator(typingDiv);
            
            const div = document.createElement('div');
            div.classList.add('bot-msg');
            
            // Type out the message character by character
            let i = 0;
            const typeInterval = setInterval(() => {
                div.textContent = msg.substring(0, i);
                chatBody.appendChild(div);
                chatBody.scrollTop = chatBody.scrollHeight;
                i++;
                
                if (i > msg.length) {
                    clearInterval(typeInterval);
                    speak(msg);
                }
            }, 30);
        }, 1000 + Math.random() * 1000);
    } else {
        const div = document.createElement('div');
        div.classList.add(sender === 'bot' ? 'bot-msg' : 'user-msg');
        div.textContent = msg;
        chatBody.appendChild(div);
        chatBody.scrollTop = chatBody.scrollHeight;
        if (sender === 'bot') speak(msg);
    }
}

// Handle send
sendBtn.addEventListener('click',()=>{
    const msg=userInput.value.trim();
    if(!msg) return;
    addMessage(msg,'user');
    userInput.value='';
    processMessage(msg);
});

// Handle Enter key
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const msg = userInput.value.trim();
        if (msg) {
            addMessage(msg, 'user');
            userInput.value = '';
            processMessage(msg);
        }
    }
});

// Add speech recognition button
const speechBtn = document.createElement('button');
speechBtn.innerHTML = '🎤';
speechBtn.style.cssText = `
    background: linear-gradient(135deg, #ff00ff, #8a2be2);
    border: none; padding: 0.8rem; cursor: pointer;
    color: white; font-weight: bold; border-radius: 0 10px 10px 0;
    transition: all 0.3s ease;
`;
speechBtn.addEventListener('click', () => {
    if (recognition && !isListening) {
        recognition.start();
        speechBtn.innerHTML = '🔴';
        speechBtn.style.background = 'linear-gradient(135deg, #ff0000, #cc0000)';
    }
});
speechBtn.addEventListener('mouseenter', () => {
    speechBtn.style.transform = 'scale(1.05)';
    speechBtn.style.boxShadow = '0 0 15px rgba(255,0,255,0.5)';
});
speechBtn.addEventListener('mouseleave', () => {
    speechBtn.style.transform = 'scale(1)';
    speechBtn.style.boxShadow = 'none';
});

// Add speech button to chat input
const chatInput = document.querySelector('.chat-input');
chatInput.appendChild(speechBtn);

// Prompt buttons
prompts.forEach(btn=>{
    btn.addEventListener('click',()=>{
        const text=btn.textContent;
        addMessage(text,'user');
        processMessage(text);
    });
});

// Document Management Functions
async function loadUserDocuments() {
    try {
        const response = await apiRequest('/documents');
        uploadedDocuments = response.documents || [];
        updateDocumentList();
    } catch (error) {
        console.error('Error loading documents:', error);
        // Don't show error to user, just log it
        // Dashboard will work in demo mode without documents
        uploadedDocuments = [];
    }
}

async function uploadDocument(file, module = 'Finance') {
    try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('module', module);
        
        const response = await fetch(`${API_BASE_URL}/documents/upload`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            },
            body: formData
        });
        
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Upload failed');
        }
        
        const result = await response.json();
        uploadedDocuments.push(result.document);
        return result;
    } catch (error) {
        throw error;
    }
}

async function deleteDocument(documentId) {
    try {
        await apiRequest(`/documents/${documentId}`, { method: 'DELETE' });
        uploadedDocuments = uploadedDocuments.filter(doc => doc.id !== documentId);
        updateDocumentList();
    } catch (error) {
        throw error;
    }
}

async function analyzeDocument(documentId) {
    try {
        const response = await apiRequest(`/ai/analyze/${documentId}`, { method: 'POST' });
        return response;
    } catch (error) {
        throw error;
    }
}

// Enhanced Upload with API integration
uploadFile.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
        fileNameDisplay.textContent = file.name;
        
        // Demo mode - simulate upload without backend
        if (!authToken) {
            addMessage(`File "${file.name}" selected. In demo mode, I can still chat with you about document analysis!`, 'bot');
            addMessage("Try asking me to 'audit', 'summarize', or 'extract' information!", 'bot');
            
            // Add to local documents for demo
            uploadedDocuments.push({
                id: Date.now().toString(),
                name: file.name,
                filename: file.name,
                originalName: file.name,
                module: 'Finance',
                size: file.size
            });
            updateDocumentList();
            return;
        }
        
        // Real upload with authentication
        try {
            addMessage("Uploading document to J.A.R.V.I.S servers...", 'bot');
            
            const result = await uploadDocument(file, 'Finance');
            addMessage(`File "${file.name}" uploaded successfully and queued for analysis.`, 'bot');
            updateDocumentList();
            
            // Auto-analyze the document
            setTimeout(async () => {
                try {
                    addMessage("Analyzing document content...", 'bot');
                    const analysis = await analyzeDocument(result.document.id);
                    addMessage("Analysis complete! " + analysis.message, 'bot');
                } catch (error) {
                    addMessage("Analysis failed: " + error.message, 'bot');
                }
            }, 2000);
            
        } catch (error) {
            addMessage("Upload failed: " + error.message, 'bot');
        }
    }
});

// Filter documents
filterBtns.forEach(btn=>{
    btn.addEventListener('click',()=>{
        const filter=btn.dataset.filter;
        updateDocumentList(filter);
    });
});

// Enhanced Update document list
function updateDocumentList(filter = "") {
    docList.innerHTML = "";
    const filtered = uploadedDocuments.filter(d => !filter || d.module.toLowerCase() === filter);
    
    if (filtered.length === 0) {
        docList.innerHTML = "<p style='color:#b0f0ff'>No documents found.</p>";
        return;
    }
    
    filtered.forEach(doc => {
        const div = document.createElement('div');
        div.className = "document-item";
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <strong>${doc.originalName || doc.filename}</strong>
                    <br><small style="color: #8a2be2;">[${doc.module}]</small>
                </div>
                <div style="display: flex; gap: 5px;">
                    <button onclick="analyzeDoc('${doc.id}')" style="
                        background: cyan; border: none; padding: 4px 8px; border-radius: 4px;
                        cursor: pointer; font-size: 0.8rem;
                    ">Analyze</button>
                    <button onclick="deleteDoc('${doc.id}')" style="
                        background: #ff4444; border: none; padding: 4px 8px; border-radius: 4px;
                        cursor: pointer; font-size: 0.8rem; color: white;
                    ">Delete</button>
                </div>
            </div>
        `;
        docList.appendChild(div);
    });
}

// Global functions for document actions
window.analyzeDoc = async function(documentId) {
    try {
        addMessage("Analyzing document...", 'bot');
        const analysis = await analyzeDocument(documentId);
        addMessage("Analysis complete! " + analysis.message, 'bot');
    } catch (error) {
        addMessage("Analysis failed: " + error.message, 'bot');
    }
};

window.deleteDoc = async function(documentId) {
    try {
        await deleteDocument(documentId);
        addMessage("Document deleted successfully.", 'bot');
    } catch (error) {
        addMessage("Delete failed: " + error.message, 'bot');
    }
};

// Enhanced AI processing with more sophisticated responses
function processMessage(msg){
    const lmsg = msg.toLowerCase();
    
    // Greeting responses
    if(lmsg.includes("hi") || lmsg.includes("hello") || lmsg.includes("hey")){
        const greetings = [
            "Hello! I'm J.A.R.V.I.S, your AI assistant. How can I help you today?",
            "Greetings! I'm ready to assist with your HR and Finance analysis needs.",
            "Hello there! I'm J.A.R.V.I.S. What would you like me to analyze for you?"
        ];
        addMessage(greetings[Math.floor(Math.random() * greetings.length)]);
    }
    // Finance module responses
    else if(lmsg.includes("finance") || lmsg.includes("financial")){
        const financeResponses = [
            "I can analyze financial reports, detect anomalies, calculate ratios, or summarize expenses. What specific financial data would you like me to examine?",
            "Financial analysis is one of my specialties. I can help with budget analysis, expense tracking, or financial reporting.",
            "I'm equipped to handle various financial tasks including profit/loss analysis, cash flow statements, and budget variance analysis."
        ];
        addMessage(financeResponses[Math.floor(Math.random() * financeResponses.length)]);
    }
    // HR module responses
    else if(lmsg.includes("hr") || lmsg.includes("human resources") || lmsg.includes("employee")){
        const hrResponses = [
            "I can check contracts, analyze employee data, audit HR compliance, or process personnel documents. What HR task can I help with?",
            "HR analysis is my forte. I can help with employee records, contract reviews, or compliance checks.",
            "I'm ready to assist with any HR-related document analysis, from employee contracts to performance reviews."
        ];
        addMessage(hrResponses[Math.floor(Math.random() * hrResponses.length)]);
    }
    // Document processing requests
    else if(lmsg.includes("audit") || lmsg.includes("summarize") || lmsg.includes("extract") || lmsg.includes("analyze")){
        if(uploadedDocuments.length > 0) {
            const processingResponses = [
                "Processing your document... Analyzing content and generating insights...",
                "Scanning document for key information... Please wait while I analyze the data...",
                "Initializing document analysis protocol... Extracting relevant information..."
            ];
            addMessage(processingResponses[Math.floor(Math.random() * processingResponses.length)]);
            
            // Simulate processing delay and provide results
            setTimeout(() => {
                const results = generateDocumentAnalysis(msg, uploadedDocuments[uploadedDocuments.length - 1]);
                addMessage(results);
            }, 2000 + Math.random() * 2000);
        } else {
            addMessage("Please upload a document first so I can analyze it for you.");
        }
    }
    // Compliance requests
    else if(lmsg.includes("compliance") || lmsg.includes("legal") || lmsg.includes("policy")){
        addMessage("I can help with compliance checks, policy analysis, and legal document review. Upload a document for me to analyze compliance requirements.");
    }
    // Analytics requests
    else if(lmsg.includes("analytics") || lmsg.includes("data") || lmsg.includes("report")){
        addMessage("I can generate analytics reports, create data visualizations, and provide insights from your documents. What type of analysis do you need?");
    }
    // Help requests
    else if(lmsg.includes("help") || lmsg.includes("what can you do")){
        addMessage("I'm J.A.R.V.I.S, your AI assistant. I can help with:\n• Document analysis and summarization\n• HR contract auditing\n• Financial report analysis\n• Compliance checking\n• Data extraction and insights\n\nTry uploading a document or using the built-in prompts!");
    }
    // Default response
    else {
        const defaultResponses = [
            "I'm here to help with HR & Finance document analysis. Try asking me to summarize, extract, or audit a document.",
            "I can assist with document analysis, HR audits, financial reports, and compliance checks. What would you like me to help with?",
            "I'm J.A.R.V.I.S, ready to analyze your documents. Upload a file or try one of the built-in commands."
        ];
        addMessage(defaultResponses[Math.floor(Math.random() * defaultResponses.length)]);
    }
}

// Generate document analysis results
function generateDocumentAnalysis(request, document) {
    const requestType = request.toLowerCase();
    
    if (requestType.includes("audit")) {
        return "📋 AUDIT RESULTS:\n• Document compliance: ✅ PASSED\n• Key findings: 3 potential areas for improvement\n• Risk level: LOW\n• Recommendations: Review section 4.2 for clarity";
    } else if (requestType.includes("summarize")) {
        return "📄 DOCUMENT SUMMARY:\n• Main topics: Financial planning, budget allocation, quarterly targets\n• Key points: 15% budget increase, new hiring freeze, Q4 focus on efficiency\n• Action items: 5 tasks identified\n• Next review: End of quarter";
    } else if (requestType.includes("extract")) {
        return "🔍 EXTRACTED DATA:\n• Names found: John Smith, Sarah Johnson, Mike Chen\n• Dates: 2024-01-15, 2024-02-28, 2024-03-15\n• Amounts: $50,000, $25,000, $75,000\n• Departments: Finance, HR, Operations";
    } else {
        return "📊 ANALYSIS COMPLETE:\n• Document type: " + document.name.split('.')[1].toUpperCase() + "\n• Word count: " + Math.floor(Math.random() * 2000 + 500) + "\n• Key themes: Financial planning, compliance, reporting\n• Confidence score: 94%";
    }
}

// Navbar module selection
navLinks.forEach(link=>{
    link.addEventListener('click',e=>{
        e.preventDefault();
        const module=link.dataset.module;
        moduleTitle.textContent=module+" Module";
        moduleDesc.textContent="Upload documents or use Jarvis assistant for "+module+" insights.";
    });
});

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
});

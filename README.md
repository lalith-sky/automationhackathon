# J.A.R.V.I.S AI Dashboard

A futuristic AI-powered dashboard for document analysis, HR management, and financial insights with a cyberpunk aesthetic.

## 🚀 Features

### Frontend
- **Holographic Interface**: 3D rotating Jarvis face with neon effects (#00ffff)
- **Cyberpunk Theme**: Dark mode with cyan/magenta highlights and particle effects
- **JARVIS Initializing Animation**: Futuristic loading screen with 3D holographic face
- **Dashboard Layout**: Left panel for document upload/filter, right panel for chatbot
- **Speech Recognition**: Voice input with text-to-speech responses
- **Document Upload**: PDF/TXT file upload with module-based filtering
- **AI Chatbot**: Intelligent document analysis with built-in prompts
- **Module Navigation**: Finance, HR, Analytics, Compliance, Reports
- **Footer**: Help Center and support links
- **Responsive Design**: Mobile-friendly interface

### Backend
- **Authentication**: Secure user registration and login with JWT
- **Document Management**: CRUD operations for document storage
- **AI Processing**: Natural language processing for document analysis
- **Module System**: Finance, HR, Analytics, Compliance, Reports
- **Real-time Analysis**: Extract names, dates, amounts, and insights
- **Static File Serving**: Serves frontend from Express

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (ES6+)
- Cyberpunk CSS animations and effects
- Web Speech API for voice recognition
- Responsive design with mobile support

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- JWT authentication
- Multer for file uploads
- Natural language processing
- RESTful API design

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Update .env with your configuration
# MONGODB_URI=mongodb://localhost:27017/jarvis-ai
# JWT_SECRET=your-secret-key
# PORT=5000

# Start the server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies (if using package.json)
npm install

# Open index.html in browser or use a local server
# For development server:
npx http-server . -p 3000
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/jarvis-ai

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=pdf,txt,doc,docx
```

## 🎯 Usage

### 1. User Registration/Login
- Register a new account or login with existing credentials
- JWT tokens are automatically managed for session persistence

### 2. Document Upload
- Select a module (Finance, HR, Analytics, Compliance, Reports)
- Upload PDF or TXT files
- Documents are automatically processed and analyzed

### 3. AI Chat Interface
- Use the floating chatbot for document analysis
- Built-in prompts for common tasks:
  - "Audit HR Contract"
  - "Summarize Finance Report"
  - "Extract Employee Names"
  - "List Compliance Issues"
- Voice input supported (click microphone button)

### 4. Document Management
- View uploaded documents by module
- Filter and search through documents
- Access analysis results and insights

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Get specific document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### AI Processing
- `POST /api/ai/analyze/:documentId` - Analyze document
- `POST /api/ai/chat` - Chat with AI
- `POST /api/ai/insights` - Generate insights

## 🎨 Customization

### Themes
The dashboard supports cyberpunk theming with:
- Neon cyan (#00ffff) and magenta (#ff00ff) accents
- Dark backgrounds with glowing effects
- Particle animations and holographic elements

### Modules
Add new modules by:
1. Updating the navbar in `frontend/index.html`
2. Adding module logic in `frontend/app.js`
3. Creating module-specific analysis in `backend/routes/ai.js`

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB Atlas or local MongoDB
2. Configure environment variables
3. Deploy to Heroku, Vercel, or AWS
4. Update CORS settings for production

### Frontend Deployment
1. Build static files
2. Deploy to Netlify, Vercel, or GitHub Pages
3. Update API endpoints in JavaScript

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- File upload validation
- Rate limiting
- CORS protection
- Input sanitization

## 📱 Mobile Support

The dashboard is fully responsive with:
- Mobile-optimized navigation
- Touch-friendly interface
- Adaptive layouts
- Mobile-specific animations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Check the documentation
- Review the API endpoints
- Test with sample documents
- Contact the development team

---

**J.A.R.V.I.S AI Dashboard** - Bringing the future of document analysis to your fingertips! 🤖✨
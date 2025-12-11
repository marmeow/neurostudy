// Load environment variables FIRST (before any other imports)
import dotenv from 'dotenv';
dotenv.config();

// Now import everything else
import express from 'express';
import cors from 'cors';
import apiRoutes from './src/routes/api.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// API Routes
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'NeuroStudy AI API',
        version: '1.0.0',
        description: 'API para el análisis de perfiles de aprendizaje',
        endpoints: {
            health: 'GET /api/health',
            questionnaire: 'GET /api/questionnaire',
            profiles: 'GET /api/profiles',
            profileById: 'GET /api/profiles/:id',
            analyze: 'POST /api/analyze',
            studyPlan: 'POST /api/study-plan'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint no encontrado'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(500).json({
        success: false,
        error: 'Error interno del servidor'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🧠 NeuroStudy AI API                                   ║
║   Server running on http://localhost:${PORT}                 ║
║                                                          ║
║   📋 Endpoints:                                          ║
║   • GET  /api/health         - Health check              ║
║   • GET  /api/questionnaire  - Get questionnaire         ║
║   • GET  /api/profiles       - Get all profiles          ║
║   • POST /api/analyze        - Analyze answers           ║
║                                                          ║
║   💬 Chat:                                               ║
║   • POST /api/chat           - Send chat message         ║
║   • GET  /api/chat/welcome   - Get welcome message       ║
║                                                          ║
║   ♿ Accessibility:                                       ║
║   • GET  /api/accessibility  - Get questions             ║
║   • POST /api/accessibility/process - Process answers    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;

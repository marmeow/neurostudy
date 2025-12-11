import express from 'express';
import { QUESTIONNAIRE } from '../config/questionnaire.js';
import { LEARNING_PROFILES, getProfileById, getAllProfiles } from '../config/profiles.js';

const router = express.Router();

// Lazy load AI service (to ensure env vars are loaded first)
let aiServiceInstance = null;
const getAIService = async () => {
    if (!aiServiceInstance) {
        const module = await import('../services/aiService.js');
        aiServiceInstance = module.default;
    }
    return aiServiceInstance;
};

/**
 * GET /api/questionnaire
 * Get the complete questionnaire structure
 */
router.get('/questionnaire', (req, res) => {
    try {
        res.json({
            success: true,
            data: QUESTIONNAIRE
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener el cuestionario'
        });
    }
});

/**
 * GET /api/profiles
 * Get all available learning profiles
 */
router.get('/profiles', (req, res) => {
    try {
        res.json({
            success: true,
            data: getAllProfiles()
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener los perfiles'
        });
    }
});

/**
 * GET /api/profiles/:id
 * Get a specific profile by ID
 */
router.get('/profiles/:id', (req, res) => {
    try {
        const profile = getProfileById(req.params.id);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Perfil no encontrado'
            });
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Error al obtener el perfil'
        });
    }
});

/**
 * POST /api/analyze
 * Analyze questionnaire answers and determine learning profile
 * 
 * Body:
 * {
 *   answers: [{ questionId: "q1", optionId: "a", profiles: ["visual-espacial"] }, ...],
 *   userInfo: { name: "optional", goals: "optional", experience: "optional" }
 * }
 */
router.post('/analyze', async (req, res) => {
    try {
        const { answers, userInfo = {} } = req.body;

        console.log('📥 /api/analyze called');
        console.log('   Answers count:', answers?.length);

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Se requieren respuestas válidas'
            });
        }

        // Get AI service (lazy loaded to ensure env vars are available)
        console.log('🔄 Loading AI Service...');
        const aiService = await getAIService();
        console.log('   AI Service loaded, isConfigured:', aiService.isConfigured);

        // Use AI to analyze the answers
        console.log('🧠 Calling analyzeProfile...');
        const result = await aiService.analyzeProfile(QUESTIONNAIRE, answers, userInfo);
        console.log('   Result success:', result.success);
        console.log('   Has warning:', !!result.warning);
        if (result.error) console.log('   Error:', result.error);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                warning: result.warning // Include any warning from the service
            });
        } else {
            // Return fallback analysis if AI fails
            console.log('⚠️ Using fallback analysis');
            res.json({
                success: true,
                data: result.fallback,
                warning: 'Análisis realizado sin IA debido a un error temporal'
            });
        }
    } catch (error) {
        console.error('❌ Analysis Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al analizar las respuestas'
        });
    }
});

/**
 * POST /api/study-plan
 * Generate a personalized study plan based on profile
 * 
 * Body:
 * {
 *   profileId: "visual-espacial",
 *   topic: "JavaScript básico",
 *   duration: "2 semanas"
 * }
 */
router.post('/study-plan', async (req, res) => {
    try {
        const { profileId, topic, duration = '1 semana' } = req.body;

        if (!profileId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere profileId y topic'
            });
        }

        // Get AI service (lazy loaded)
        const aiService = await getAIService();

        const result = await aiService.generateStudyPlan(profileId, topic, duration);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        console.error('Study Plan Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar el plan de estudio'
        });
    }
});

// Lazy load Chat service
let chatServiceInstance = null;
const getChatService = async () => {
    if (!chatServiceInstance) {
        const module = await import('../services/chatService.js');
        chatServiceInstance = module.default;
    }
    return chatServiceInstance;
};

// Lazy load Accessibility config
let accessibilityConfig = null;
const getAccessibilityConfig = async () => {
    if (!accessibilityConfig) {
        accessibilityConfig = await import('../config/accessibility.js');
    }
    return accessibilityConfig;
};

/**
 * GET /api/accessibility
 * Get accessibility questions
 */
router.get('/accessibility', async (req, res) => {
    try {
        const { ACCESSIBILITY_QUESTIONS } = await getAccessibilityConfig();
        res.json({
            success: true,
            data: ACCESSIBILITY_QUESTIONS
        });
    } catch (error) {
        console.error('Accessibility Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtenir les preguntes d\'accessibilitat'
        });
    }
});

/**
 * POST /api/accessibility/process
 * Process accessibility answers and return adaptations
 */
router.post('/accessibility/process', async (req, res) => {
    try {
        const { answers } = req.body;
        const { processAccessibilityAnswers } = await getAccessibilityConfig();

        const adaptations = processAccessibilityAnswers(answers || []);

        res.json({
            success: true,
            data: {
                adaptations,
                count: adaptations.length
            }
        });
    } catch (error) {
        console.error('Accessibility Process Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al processar les adaptacions'
        });
    }
});

/**
 * POST /api/chat
 * Send a message to the AI chat
 * 
 * Body:
 * {
 *   messages: [{ role: "user", content: "Hola" }],
 *   profileId: "visualis",
 *   accessibilitySettings: { simplifiedText: true }
 * }
 */
router.post('/chat', async (req, res) => {
    try {
        const { messages, profileId, accessibilitySettings = {} } = req.body;

        console.log('💬 /api/chat called');
        console.log('   Profile:', profileId);
        console.log('   Messages count:', messages?.length);

        if (!messages || !Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Es requereixen missatges vàlids'
            });
        }

        const chatService = await getChatService();
        const result = await chatService.chat(messages, profileId, accessibilitySettings);

        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.json({
                success: false,
                error: result.error,
                fallback: result.fallback
            });
        }
    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al processar el missatge'
        });
    }
});

/**
 * GET /api/chat/welcome/:profileId
 * Get a welcome message adapted to the profile
 */
router.get('/chat/welcome/:profileId', async (req, res) => {
    try {
        const { profileId } = req.params;

        const chatService = await getChatService();
        const result = await chatService.getWelcomeMessage(profileId);

        res.json({
            success: true,
            data: result.data
        });
    } catch (error) {
        console.error('Welcome Message Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al obtenir el missatge de benvinguda'
        });
    }
});

/**
 * GET /api/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'NeuroStudy API is running',
        timestamp: new Date().toISOString(),
        features: ['profiles', 'questionnaire', 'chat', 'accessibility']
    });
});

export default router;


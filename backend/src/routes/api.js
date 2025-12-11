import express from 'express';
import { QUESTIONNAIRE } from '../config/questionnaire.js';
import { LEARNING_PROFILES, getProfileById, getAllProfiles } from '../config/profiles.js';

const router = express.Router();

// Lazy load Profile Analyzer service
let profileAnalyzerInstance = null;
const getProfileAnalyzer = async () => {
    if (!profileAnalyzerInstance) {
        const module = await import('../services/profileAnalyzer.js');
        profileAnalyzerInstance = module.default;
    }
    return profileAnalyzerInstance;
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

        // Get Profile Analyzer service
        console.log('🔄 Loading Profile Analyzer...');
        const profileAnalyzer = await getProfileAnalyzer();

        // Analyze the answers using our algorithm
        console.log('🧠 Analyzing profile...');
        const result = profileAnalyzer.analyzeProfile(QUESTIONNAIRE, answers, userInfo);
        console.log('   Result success:', result.success);
        console.log('   Primary profile:', result.data?.primaryProfile);
        console.log('   Confidence:', result.data?.confidence + '%');

        res.json({
            success: true,
            data: result.data
        });
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
 *   profileId: "visualis",
 *   topic: "JavaScript básico",
 *   duration: "2 semanas"
 * }
 */
router.post('/study-plan', async (req, res) => {
    try {
        const { profileId, topic, duration = '1 setmana' } = req.body;

        if (!profileId || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Es requereix profileId i topic'
            });
        }

        const profile = getProfileById(profileId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Perfil no trobat'
            });
        }

        // Generate study plan based on profile preferences
        const studyPlan = generateStudyPlan(profile, topic, duration);

        res.json({
            success: true,
            data: studyPlan
        });
    } catch (error) {
        console.error('Study Plan Error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al generar el pla d\'estudi'
        });
    }
});

/**
 * Genera un pla d'estudi basat en el perfil de l'usuari
 */
function generateStudyPlan(profile, topic, duration) {
    const durationDays = parseDuration(duration);

    // Plantillas de actividades por perfil
    const activityTemplates = {
        'visualis': [
            `Mira un vídeo introductori sobre ${topic}`,
            `Crea un mapa mental dels conceptes clau`,
            `Busca infografies relacionades amb ${topic}`,
            `Dibuixa un diagrama que resumeixi el que has après`,
            `Repassa amb flashcards visuals`
        ],
        'narra': [
            `Llegeix una història o cas real sobre ${topic}`,
            `Busca exemples pràctics de la vida quotidiana`,
            `Escriu un resum com si expliquessis una història`,
            `Troba documentals o podcasts sobre ${topic}`,
            `Connecta el tema amb experiències personals`
        ],
        'logika': [
            `Llegeix la definició formal de ${topic}`,
            `Crea una llista ordenada dels conceptes principals`,
            `Fes una taula comparativa dels elements clau`,
            `Segueix un tutorial pas a pas`,
            `Resol exercicis estructurats`
        ],
        'prax': [
            `Fes un exercici pràctic introductori sobre ${topic}`,
            `Experimenta amb un projecte petit`,
            `Practica amb errors i aprèn d'ells`,
            `Crea alguna cosa tangible relacionada amb el tema`,
            `Resol reptes pràctics`
        ],
        'kreo': [
            `Explora lliurement recursos sobre ${topic}`,
            `Planteja les teves pròpies preguntes`,
            `Busca connexions amb altres temes que coneguis`,
            `Proposa una solució creativa a un problema`,
            `Crea un projecte personal únic`
        ]
    };

    const activities = activityTemplates[profile.id] || activityTemplates['logika'];
    const dailyPlan = [];

    for (let day = 1; day <= durationDays; day++) {
        const dayActivities = [];
        const activityIndex = (day - 1) % activities.length;

        dayActivities.push(activities[activityIndex]);
        if (day <= 3) {
            dayActivities.push(`Pren notes amb el teu estil ${profile.shortDescription.toLowerCase()}`);
        } else {
            dayActivities.push(`Repassa el que has après els dies anteriors`);
        }

        dailyPlan.push({
            day,
            activities: dayActivities,
            resources: profile.contentRecommendations.slice(0, 2),
            duration: '1-2 hores'
        });
    }

    return {
        topic,
        duration,
        profile: profile.name,
        objectives: [
            `Comprendre els conceptes bàsics de ${topic}`,
            `Aplicar el coneixement amb el teu estil ${profile.shortDescription.toLowerCase()}`,
            `Consolidar l'aprenentatge amb pràctica regular`
        ],
        dailyPlan,
        tips: profile.learningStrategies.slice(0, 3),
        generatedAt: new Date().toISOString()
    };
}

/**
 * Parseja la duració i retorna el nombre de dies
 */
function parseDuration(duration) {
    const lower = duration.toLowerCase();
    if (lower.includes('setman')) {
        const weeks = parseInt(lower) || 1;
        return weeks * 7;
    }
    if (lower.includes('di')) {
        return parseInt(lower) || 7;
    }
    if (lower.includes('mes')) {
        const months = parseInt(lower) || 1;
        return months * 30;
    }
    return 7; // Default: 1 semana
}

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


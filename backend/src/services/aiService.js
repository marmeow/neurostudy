import Groq from 'groq-sdk';
import { LEARNING_PROFILES, getProfileById } from '../config/profiles.js';

/**
 * AI Service for profile analysis using Groq
 */
class AIService {
    constructor() {
        this.groq = null;
        this.model = 'llama-3.3-70b-versatile'; // Updated model (3.1 was decommissioned)
        this.isConfigured = null; // null = not checked yet, true/false = checked
    }

    /**
     * Initialize Groq client (lazy initialization - called on first use)
     */
    initializeGroq() {
        // Only initialize once
        if (this.isConfigured !== null) {
            return this.isConfigured;
        }

        const apiKey = process.env.GROQ_API_KEY;

        console.log('🔍 Checking GROQ_API_KEY...');
        console.log('   Key exists:', !!apiKey);
        console.log('   Key length:', apiKey ? apiKey.length : 0);

        if (apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 10) {
            try {
                this.groq = new Groq({ apiKey });
                this.isConfigured = true;
                console.log('✅ Groq AI configured successfully');
            } catch (error) {
                console.warn('⚠️ Could not initialize Groq:', error.message);
                this.isConfigured = false;
            }
        } else {
            console.warn('⚠️ GROQ_API_KEY not configured - running in fallback mode');
            console.warn('   Get your free API key at: https://console.groq.com/keys');
            this.isConfigured = false;
        }

        return this.isConfigured;
    }

    /**
     * Build the system prompt for profile analysis
     */
    buildSystemPrompt() {
        const profilesDescription = Object.values(LEARNING_PROFILES)
            .map(p => `- ${p.id}: ${p.name} (${p.shortDescription}) - ${p.description}`)
            .join('\n');

        return `Ets un expert en psicologia educativa i estils d'aprenentatge. La teva tasca és analitzar les respostes d'un usuari a un qüestionari i determinar el seu perfil d'aprenentatge predominant.

Els perfils disponibles són:
${profilesDescription}

INSTRUCCIONS:
1. Analitza les respostes de l'usuari amb cura
2. Considera els patrons en les seves preferències
3. Identifica el perfil primari i secundari
4. Proporciona una explicació personalitzada en català
5. Suggereix estratègies d'aprenentatge específiques

FORMAT DE RESPOSTA (JSON):
{
  "primaryProfile": "id-del-perfil",
  "secondaryProfile": "id-del-perfil",
  "confidence": 85,
  "isHybrid": false,
  "analysis": "Explicació personalitzada del perquè aquest perfil...",
  "strengths": ["Fortalesa 1", "Fortalesa 2", "Fortalesa 3"],
  "recommendations": ["Recomanació 1", "Recomanació 2", "Recomanació 3"],
  "studyTips": ["Consell 1", "Consell 2", "Consell 3"]
}

Els IDs de perfil vàlids són: visualis, narra, logika, prax, kreo
Només respon amb el JSON, sense text addicional.`;
    }

    /**
     * Format user answers for the AI prompt
     */
    formatAnswersForPrompt(questionnaire, answers) {
        const formattedAnswers = [];

        for (const section of questionnaire.sections) {
            for (const question of section.questions) {
                const answer = answers.find(a => a.questionId === question.id);
                if (answer) {
                    const selectedOption = question.options.find(o => o.id === answer.optionId);
                    formattedAnswers.push({
                        question: question.text,
                        answer: selectedOption ? selectedOption.text : 'No respondida'
                    });
                }
            }
        }

        return formattedAnswers;
    }

    /**
     * Analyze user answers and determine learning profile using AI
     */
    async analyzeProfile(questionnaire, answers, additionalContext = {}) {
        // Lazy initialize Groq on first use
        const aiAvailable = this.initializeGroq();

        // If AI is not available, use fallback immediately
        if (!aiAvailable) {
            return {
                success: true,
                data: this.getFallbackAnalysis(answers),
                warning: 'Análisis realizado sin IA (modo fallback)'
            };
        }

        try {
            const formattedAnswers = this.formatAnswersForPrompt(questionnaire, answers);

            const userMessage = `Analiza las siguientes respuestas del cuestionario de un usuario:

RESPUESTAS:
${formattedAnswers.map((a, i) => `${i + 1}. Pregunta: "${a.question}"\n   Respuesta: "${a.answer}"`).join('\n\n')}

${additionalContext.name ? `Nombre del usuario: ${additionalContext.name}` : ''}
${additionalContext.goals ? `Objetivos de aprendizaje: ${additionalContext.goals}` : ''}
${additionalContext.experience ? `Experiencia previa: ${additionalContext.experience}` : ''}

Determina el perfil de aprendizaje más adecuado para este usuario.`;

            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: this.buildSystemPrompt() },
                    { role: 'user', content: userMessage }
                ],
                model: this.model,
                temperature: 0.3, // Lower temperature for more consistent results
                max_tokens: 1024,
                response_format: { type: 'json_object' }
            });

            const response = completion.choices[0]?.message?.content;

            if (!response) {
                throw new Error('No response from AI');
            }

            const aiResult = JSON.parse(response);

            // Enrich with full profile data
            const primaryProfileData = getProfileById(aiResult.primaryProfile);
            const secondaryProfileData = getProfileById(aiResult.secondaryProfile);

            return {
                success: true,
                data: {
                    ...aiResult,
                    primaryProfileDetails: primaryProfileData,
                    secondaryProfileDetails: secondaryProfileData,
                    timestamp: new Date().toISOString()
                }
            };

        } catch (error) {
            console.error('AI Analysis Error:', error);
            return {
                success: false,
                error: error.message,
                fallback: this.getFallbackAnalysis(answers)
            };
        }
    }

    /**
     * Fallback analysis without AI (in case of API issues)
     */
    getFallbackAnalysis(answers) {
        const profileScores = {
            'visualis': 0,
            'narra': 0,
            'logika': 0,
            'prax': 0,
            'kreo': 0
        };

        // Simple scoring based on answer patterns
        for (const answer of answers) {
            if (answer.profiles) {
                for (const profile of answer.profiles) {
                    if (profileScores.hasOwnProperty(profile)) {
                        profileScores[profile]++;
                    }
                }
            }
        }

        const sorted = Object.entries(profileScores).sort(([, a], [, b]) => b - a);
        const primaryScore = sorted[0][1];
        const secondaryScore = sorted[1][1];

        // Check if hybrid profile
        const isHybrid = primaryScore > 0 && secondaryScore > 0 &&
            (primaryScore - secondaryScore) <= 2;

        const primaryProfileData = getProfileById(sorted[0][0]);
        const secondaryProfileData = getProfileById(sorted[1][0]);

        return {
            primaryProfile: sorted[0][0],
            secondaryProfile: sorted[1][0],
            confidence: answers.length > 0 ? Math.round((primaryScore / answers.length) * 100) : 0,
            isHybrid,
            analysis: `Anàlisi basat en les respostes del qüestionari. El teu perfil principal és ${primaryProfileData?.name || 'desconegut'}.`,
            strengths: primaryProfileData?.characteristics?.slice(0, 3) || [],
            recommendations: primaryProfileData?.contentRecommendations?.slice(0, 3) || [],
            studyTips: primaryProfileData?.learningStrategies?.slice(0, 3) || [],
            primaryProfileDetails: primaryProfileData,
            secondaryProfileDetails: secondaryProfileData
        };
    }

    /**
     * Generate personalized study recommendations
     */
    async generateStudyPlan(profileId, topic, duration = '1 semana') {
        try {
            const profile = getProfileById(profileId);

            if (!profile) {
                throw new Error('Profile not found');
            }

            const completion = await this.groq.chat.completions.create({
                messages: [
                    {
                        role: 'system',
                        content: `Eres un experto en educación personalizada. Genera planes de estudio adaptados al perfil de aprendizaje del usuario.
            
El usuario tiene el perfil: ${profile.name} - ${profile.description}

Sus preferencias de contenido incluyen: ${profile.contentRecommendations.join(', ')}

Genera un plan de estudio en formato JSON con la siguiente estructura:
{
  "topic": "tema",
  "duration": "duración",
  "objectives": ["objetivo 1", "objetivo 2"],
  "dailyPlan": [
    {
      "day": 1,
      "activities": ["actividad 1", "actividad 2"],
      "resources": ["recurso 1", "recurso 2"],
      "duration": "2 horas"
    }
  ],
  "tips": ["consejo 1", "consejo 2"]
}`
                    },
                    {
                        role: 'user',
                        content: `Genera un plan de estudio sobre "${topic}" para ${duration}.`
                    }
                ],
                model: this.model,
                temperature: 0.5,
                max_tokens: 2048,
                response_format: { type: 'json_object' }
            });

            const response = completion.choices[0]?.message?.content;
            return {
                success: true,
                data: JSON.parse(response)
            };

        } catch (error) {
            console.error('Study Plan Generation Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

// Lazy singleton - only create instance when first accessed
let instance = null;

const getAIService = () => {
    if (!instance) {
        instance = new AIService();
    }
    return instance;
};

export default getAIService();
export { getAIService, AIService };


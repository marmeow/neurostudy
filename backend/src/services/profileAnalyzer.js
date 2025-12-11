/**
 * Profile Analyzer Service - NeuroStudy
 * Algoritmo de determinación de perfil de aprendizaje mediante lógica propia
 * Sin dependencia de IA externa
 */

import { LEARNING_PROFILES, getProfileById } from '../config/profiles.js';

/**
 * Pesos de las secciones del cuestionario
 * Algunas secciones son más reveladoras del perfil real del usuario
 */
const SECTION_WEIGHTS = {
    'processing': 1.5,    // Cómo procesa la información es muy revelador
    'habits': 1.2,        // Los hábitos de estudio son importantes
    'preferences': 1.0,   // Preferencias generales
    'motivation': 1.3     // La motivación revela mucho del perfil
};

/**
 * Mapeo de preguntas a secciones
 */
const QUESTION_SECTIONS = {
    'q1': 'processing', 'q2': 'processing', 'q3': 'processing',
    'q4': 'habits', 'q5': 'habits', 'q6': 'habits',
    'q7': 'preferences', 'q8': 'preferences', 'q9': 'preferences',
    'q10': 'motivation', 'q11': 'motivation', 'q12': 'motivation'
};

/**
 * Preguntas clave que tienen más peso en la determinación del perfil
 * (preguntas más directas sobre el estilo de aprendizaje)
 */
const KEY_QUESTIONS = ['q1', 'q3', 'q8'];
const KEY_QUESTION_BONUS = 0.5;

/**
 * Clase principal del analizador de perfiles
 */
class ProfileAnalyzer {
    constructor() {
        this.profiles = ['visualis', 'narra', 'logika', 'prax', 'kreo'];
    }

    /**
     * Analiza las respuestas y determina el perfil de aprendizaje
     * @param {Object} questionnaire - Estructura del cuestionario
     * @param {Array} answers - Respuestas del usuario
     * @param {Object} additionalContext - Contexto adicional (opcional)
     * @returns {Object} Resultado del análisis
     */
    analyzeProfile(questionnaire, answers, additionalContext = {}) {
        // Calcular puntuaciones ponderadas
        const scores = this.calculateWeightedScores(answers);

        // Ordenar perfiles por puntuación
        const sortedProfiles = Object.entries(scores)
            .sort(([, a], [, b]) => b - a);

        const primaryProfileId = sortedProfiles[0][0];
        const secondaryProfileId = sortedProfiles[1][0];
        const primaryScore = sortedProfiles[0][1];
        const secondaryScore = sortedProfiles[1][1];
        const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);

        // Calcular confianza basada en la diferencia entre perfiles
        const confidence = this.calculateConfidence(primaryScore, secondaryScore, totalScore);

        // Determinar si es un perfil híbrido
        const isHybrid = this.checkHybridProfile(primaryScore, secondaryScore, answers.length);

        // Obtener datos completos de los perfiles
        const primaryProfileData = getProfileById(primaryProfileId);
        const secondaryProfileData = getProfileById(secondaryProfileId);

        // Generar análisis personalizado
        const analysis = this.generateAnalysis(
            primaryProfileData,
            secondaryProfileData,
            isHybrid,
            confidence,
            scores
        );

        // Generar fortalezas basadas en el perfil
        const strengths = this.generateStrengths(primaryProfileData, secondaryProfileData, isHybrid);

        // Generar recomendaciones
        const recommendations = this.generateRecommendations(primaryProfileData, secondaryProfileData, isHybrid);

        // Generar consejos de estudio
        const studyTips = this.generateStudyTips(primaryProfileData, secondaryProfileData, isHybrid);

        return {
            success: true,
            data: {
                primaryProfile: primaryProfileId,
                secondaryProfile: secondaryProfileId,
                confidence: Math.round(confidence),
                isHybrid,
                analysis,
                strengths,
                recommendations,
                studyTips,
                primaryProfileDetails: primaryProfileData,
                secondaryProfileDetails: secondaryProfileData,
                scores: scores,
                timestamp: new Date().toISOString()
            }
        };
    }

    /**
     * Calcula las puntuaciones ponderadas por perfil
     */
    calculateWeightedScores(answers) {
        const scores = {
            'visualis': 0,
            'narra': 0,
            'logika': 0,
            'prax': 0,
            'kreo': 0
        };

        for (const answer of answers) {
            if (answer.profiles && Array.isArray(answer.profiles)) {
                // Obtener el peso de la sección
                const section = QUESTION_SECTIONS[answer.questionId] || 'preferences';
                const sectionWeight = SECTION_WEIGHTS[section] || 1.0;

                // Bonus para preguntas clave
                const keyBonus = KEY_QUESTIONS.includes(answer.questionId) ? KEY_QUESTION_BONUS : 0;

                // Aplicar puntuación a cada perfil asociado con la respuesta
                for (const profile of answer.profiles) {
                    if (scores.hasOwnProperty(profile)) {
                        scores[profile] += sectionWeight + keyBonus;
                    }
                }
            }
        }

        return scores;
    }

    /**
     * Calcula el nivel de confianza del resultado
     */
    calculateConfidence(primaryScore, secondaryScore, totalScore) {
        if (totalScore === 0) return 0;

        // Factor 1: Proporción del perfil primario respecto al total
        const dominanceFactor = (primaryScore / totalScore) * 100;

        // Factor 2: Diferencia entre primario y secundario
        const differenceFactor = ((primaryScore - secondaryScore) / primaryScore) * 30;

        // Combinar factores (max 100)
        const confidence = Math.min(100, dominanceFactor + differenceFactor);

        return Math.max(30, confidence); // Mínimo 30% de confianza
    }

    /**
     * Determina si el usuario tiene un perfil híbrido
     */
    checkHybridProfile(primaryScore, secondaryScore, numAnswers) {
        if (primaryScore === 0 || secondaryScore === 0) return false;

        // Es híbrido si la diferencia es pequeña (menos del 20% del score primario)
        const difference = primaryScore - secondaryScore;
        const threshold = primaryScore * 0.2;

        return difference <= threshold && secondaryScore >= (numAnswers * 0.3);
    }

    /**
     * Genera un análisis personalizado en catalán
     */
    generateAnalysis(primary, secondary, isHybrid, confidence, scores) {
        if (!primary) return "No s'ha pogut determinar el perfil.";

        let analysis = '';

        if (isHybrid) {
            analysis = `Tens un perfil d'aprenentatge **híbrid** que combina característiques de **${primary.name}** i **${secondary.name}**. `;
            analysis += `Això significa que aprens de manera efectiva tant ${this.getProfileMethod(primary.id)} com ${this.getProfileMethod(secondary.id)}. `;
            analysis += `Aquesta combinació et dóna flexibilitat per adaptar-te a diferents tipus de contingut i situacions d'aprenentatge.`;
        } else {
            analysis = `El teu perfil d'aprenentatge predominant és **${primary.name}** (${primary.shortDescription}). `;
            analysis += `${primary.description} `;

            if (confidence >= 70) {
                analysis += `Amb un ${Math.round(confidence)}% de confiança, les teves respostes mostren una clara preferència per aquest estil d'aprenentatge.`;
            } else if (confidence >= 50) {
                analysis += `També mostres algunes característiques del perfil **${secondary.name}**, que podrien complementar el teu estil principal.`;
            } else {
                analysis += `Tens un perfil versàtil amb tendències cap a diversos estils, sent ${primary.name} lleugerament predominant.`;
            }
        }

        return analysis;
    }

    /**
     * Obtiene la descripción del método de aprendizaje
     */
    getProfileMethod(profileId) {
        const methods = {
            'visualis': 'amb imatges i representacions visuals',
            'narra': 'amb històries i exemples contextualitzats',
            'logika': 'amb estructures ordenades i lògiques',
            'prax': 'practicant i experimentant directament',
            'kreo': 'explorant i creant connexions noves'
        };
        return methods[profileId] || '';
    }

    /**
     * Genera fortalezas basadas en el perfil
     */
    generateStrengths(primary, secondary, isHybrid) {
        const strengths = [];

        if (primary?.characteristics) {
            // Añadir las 2 primeras características del perfil primario
            strengths.push(...primary.characteristics.slice(0, 2));
        }

        if (isHybrid && secondary?.characteristics) {
            // Si es híbrido, añadir 1 del secundario
            strengths.push(secondary.characteristics[0]);
        } else if (primary?.characteristics?.length > 2) {
            // Si no es híbrido, añadir una tercera del primario
            strengths.push(primary.characteristics[2]);
        }

        return strengths.length > 0 ? strengths : [
            'Capacitat d\'adaptació a diferents mètodes',
            'Aprenentatge flexible i versàtil',
            'Potencial per combinar diversos estils'
        ];
    }

    /**
     * Genera recomendaciones de contenido
     */
    generateRecommendations(primary, secondary, isHybrid) {
        const recommendations = [];

        if (primary?.contentRecommendations) {
            // Añadir las 2-3 primeras recomendaciones del perfil primario
            recommendations.push(...primary.contentRecommendations.slice(0, isHybrid ? 2 : 3));
        }

        if (isHybrid && secondary?.contentRecommendations) {
            // Si es híbrido, añadir 1 del secundario
            recommendations.push(secondary.contentRecommendations[0]);
        }

        return recommendations.length > 0 ? recommendations : [
            'Contingut multimèdia variat',
            'Exercicis pràctics',
            'Materials adaptats al teu ritme'
        ];
    }

    /**
     * Genera consejos de estudio personalizados
     */
    generateStudyTips(primary, secondary, isHybrid) {
        const tips = [];

        if (primary?.learningStrategies) {
            tips.push(...primary.learningStrategies.slice(0, isHybrid ? 2 : 3));
        }

        if (isHybrid && secondary?.learningStrategies) {
            tips.push(secondary.learningStrategies[0]);
        }

        // Añadir un tip general si no hay suficientes
        if (tips.length < 3) {
            tips.push('Experimenta amb diferents mètodes i descobreix què funciona millor per a cada tema');
        }

        return tips;
    }
}

// Singleton instance
const profileAnalyzer = new ProfileAnalyzer();

export default profileAnalyzer;
export { ProfileAnalyzer };

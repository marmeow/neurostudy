import Groq from 'groq-sdk';
import { LEARNING_PROFILES, getProfileById } from '../config/profiles.js';

/**
 * Chat Service for adaptive conversations with Groq
 */
class ChatService {
    constructor() {
        this.groq = null;
        this.model = 'llama-3.3-70b-versatile'; // Updated model (3.1 was decommissioned)
        this.isConfigured = null;
    }

    /**
     * Initialize Groq client (lazy initialization)
     */
    initializeGroq() {
        if (this.isConfigured !== null) {
            return this.isConfigured;
        }

        const apiKey = process.env.GROQ_API_KEY;

        if (apiKey && apiKey !== 'your_api_key_here' && apiKey.length > 10) {
            try {
                this.groq = new Groq({ apiKey });
                this.isConfigured = true;
                console.log('✅ Chat Service: Groq configured');
            } catch (error) {
                console.warn('⚠️ Chat Service: Could not initialize Groq:', error.message);
                this.isConfigured = false;
            }
        } else {
            this.isConfigured = false;
        }

        return this.isConfigured;
    }

    /**
     * Build system prompt adapted to user's learning profile
     */
    buildAdaptiveSystemPrompt(profileId, accessibilitySettings = {}) {
        const profile = getProfileById(profileId);

        if (!profile) {
            return this.getDefaultSystemPrompt();
        }

        let prompt = `Ets un assistent educatiu anomenat NeuroStudy AI. El teu objectiu és ajudar l'usuari a aprendre de la manera més efectiva possible.

PERFIL DE L'USUARI: ${profile.name} (${profile.shortDescription})
${profile.description}

INSTRUCCIONS D'ADAPTACIÓ SEGONS EL PERFIL:
`;

        // Add profile-specific instructions
        switch (profileId) {
            case 'visualis':
                prompt += `
- Utilitza MOLTES analogies visuals i metàfores
- Descriu les coses en termes d'imatges, colors i formes
- Suggereix crear diagrames o esquemes
- Usa emojis per fer el text més visual 🎨📊🖼️
- Estructura les respostes amb llistes i punts
- Ofereix descripcions vívides i pictòriques`;
                break;

            case 'narra':
                prompt += `
- Explica els conceptes mitjançant HISTÒRIES i exemples reals
- Comença amb el context i la història darrere dels conceptes
- Utilitza anècdotes i casos pràctics de la vida quotidiana
- Connecta els temes amb experiències que l'usuari pugui reconèixer
- Parla de forma conversacional i propera
- Inclou el "per què" i el "com" dels conceptes`;
                break;

            case 'logika':
                prompt += `
- Estructura la informació de forma LÒGICA i ordenada
- Utilitza definicions clares i precises
- Presenta la informació pas a pas, numerada
- Inclou taules comparatives quan sigui útil
- Evita informació innecessària o divagacions
- Ofereix regles i patrons clars`;
                break;

            case 'prax':
                prompt += `
- Centra't en l'APLICACIÓ PRÀCTICA dels conceptes
- Proposa exercicis i activitats per fer
- Dona exemples de codi o passos concrets
- Minimitza la teoria, maximitza la pràctica
- Inclou reptes i exercicis al final de cada explicació
- Anima a experimentar i provar`;
                break;

            case 'kreo':
                prompt += `
- Fomenta la CREATIVITAT i l'exploració
- Planteja preguntes obertes i reptes
- Connecta el tema amb altres àrees inesperades
- Anima a pensar "fora de la caixa"
- Proposa projectes creatius i oberts
- Deixa espai per a la interpretació personal`;
                break;
        }

        // Add accessibility adaptations
        if (accessibilitySettings.simplifiedText) {
            prompt += `

ACCESSIBILITAT - TEXT SIMPLIFICAT:
- Utilitza frases curtes i clares
- Evita paraules complexes o tècniques
- Un concepte per paràgraf
- Resumeix les idees principals`;
        }

        if (accessibilitySettings.extendedTime) {
            prompt += `

ACCESSIBILITAT - TEMPS AMPLIAT:
- Explica cada cosa amb calma i detall
- No tinguis pressa en les explicacions
- Repeteix els conceptes clau de diferents maneres`;
        }

        prompt += `

REGLES GENERALS:
- Respon sempre en CATALÀ
- Sigues amable i encoratjador
- Adapta la complexitat al nivell de l'usuari
- Si l'usuari sembla confós, simplifica l'explicació
- Ofereix ajuda addicional al final de cada resposta`;

        return prompt;
    }

    /**
     * Get default system prompt
     */
    getDefaultSystemPrompt() {
        return `Ets un assistent educatiu anomenat NeuroStudy AI. Ajudes als usuaris a aprendre de forma efectiva.

INSTRUCCIONS:
- Respon sempre en CATALÀ
- Sigues amable i encoratjador
- Adapta les explicacions al nivell de l'usuari
- Ofereix exemples pràctics
- Estructura les respostes de forma clara`;
    }

    /**
     * Send a message and get a response
     */
    async chat(messages, profileId = null, accessibilitySettings = {}) {
        const aiAvailable = this.initializeGroq();

        if (!aiAvailable) {
            return {
                success: false,
                error: 'El servei de xat no està disponible',
                fallback: {
                    role: 'assistant',
                    content: 'Ho sento, el servei de xat no està disponible en aquest moment. Si us plau, torna-ho a provar més tard.'
                }
            };
        }

        try {
            const systemPrompt = this.buildAdaptiveSystemPrompt(profileId, accessibilitySettings);

            const completion = await this.groq.chat.completions.create({
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...messages
                ],
                model: this.model,
                temperature: 0.7,
                max_tokens: 1024,
                stream: false
            });

            const response = completion.choices[0]?.message;

            return {
                success: true,
                data: {
                    message: response,
                    usage: completion.usage
                }
            };

        } catch (error) {
            console.error('Chat Error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Generate a welcome message based on profile
     */
    async getWelcomeMessage(profileId) {
        const profile = getProfileById(profileId);

        if (!profile) {
            return {
                success: true,
                data: {
                    message: {
                        role: 'assistant',
                        content: `Hola! 👋 Sóc el teu assistent d'aprenentatge personalitzat. Com et puc ajudar avui?`
                    }
                }
            };
        }

        const welcomeMessages = {
            'visualis': `Hola! 👋🎨 Sóc el teu assistent adaptat al teu perfil **Visualis**. 

M'encanta explicar les coses amb imatges, diagrames i exemples visuals. 📊

Què t'agradaria aprendre avui? Puc fer-te esquemes, explicar-te conceptes amb analogies visuals, o ajudar-te a crear mapes mentals! 🖼️`,

            'narra': `Hola! 👋📖 Sóc el teu assistent adaptat al teu perfil **Narra**.

M'agrada explicar les coses com si fossin històries, amb context i exemples de la vida real.

Què t'agradaria aprendre? T'explicaré la història darrere de cada concepte i com s'aplica al món real! 🌍`,

            'logika': `Hola! 👋🔢 Sóc el teu assistent adaptat al teu perfil **Logika**.

Especialitzat en explicacions estructurades, pas a pas i amb definicions clares.

Què t'agradaria aprendre? Et proporcionaré:
1. Definicions precises
2. Passos ordenats
3. Taules comparatives quan calgui`,

            'prax': `Hola! 👋🔧 Sóc el teu assistent adaptat al teu perfil **Prax**.

Aquí no perdem temps amb teoria innecessària - anem directes a la pràctica!

Què vols aprendre? Et proposaré exercicis, exemples pràctics i reptes per posar-ho en acció immediatament! 💪`,

            'kreo': `Hola! 👋💡 Sóc el teu assistent adaptat al teu perfil **Kreo**.

M'encanta explorar idees, fer connexions inesperades i pensar de forma creativa!

Què t'agradaria descobrir avui? Podem explorar el tema des d'angles diferents i veure on ens porta la curiositat! ✨`
        };

        return {
            success: true,
            data: {
                message: {
                    role: 'assistant',
                    content: welcomeMessages[profileId] || welcomeMessages['narra']
                }
            }
        };
    }
}

// Lazy singleton
let chatInstance = null;

const getChatService = () => {
    if (!chatInstance) {
        chatInstance = new ChatService();
    }
    return chatInstance;
};

export default getChatService();
export { getChatService, ChatService };

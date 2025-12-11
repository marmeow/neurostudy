/**
 * Learning Profiles Configuration - NeuroStudy AI
 * Els 5 perfils cognitius d'aprenentatge
 */

export const LEARNING_PROFILES = {
    VISUALIS: {
        id: 'visualis',
        name: 'Visualis',
        emoji: '🎨',
        color: '#8b5cf6',
        description: 'Aprèn millor amb imatges, vídeos, esquemes i representacions gràfiques.',
        shortDescription: 'Visual',
        characteristics: [
            'Reté informació fàcilment quan es presenta en format visual',
            'Prefereix diagrames, mapes mentals i infografies',
            'Recorda millor colors, formes i disposició espacial',
            'Pensa en imatges i visualitza conceptes abstractes'
        ],
        contentRecommendations: [
            'Diagrames i infografies',
            'Vídeos explicatius breus',
            'Mapes mentals i conceptuals',
            'Esquemes amb colors',
            'Presentacions visuals animades',
            'Imatges i fotografies il·lustratives'
        ],
        learningStrategies: [
            'Usa colors per destacar informació important',
            'Crea mapes mentals per organitzar conceptes',
            'Mira vídeos abans de llegir el text',
            'Transforma apunts en diagrames visuals'
        ],
        uiPreferences: {
            theme: 'colorful',
            useAnimations: true,
            iconDensity: 'high',
            visualFeedback: true,
            preferredFormat: 'visual'
        }
    },

    NARRA: {
        id: 'narra',
        name: 'Narra',
        emoji: '📖',
        color: '#22c55e',
        description: 'Prefereix explicacions contextualitzades, històries i exemples de la vida real.',
        shortDescription: 'Narratiu',
        characteristics: [
            'Aprèn millor amb històries i exemples reals',
            'Necessita context abans d\'entendre conceptes',
            'Recorda anècdotes i casos pràctics',
            'Connecta coneixements amb experiències quotidianes'
        ],
        contentRecommendations: [
            'Històries introductòries',
            'Exemples de la vida real',
            'Casos d\'estudi',
            'Narracions contextualitzades',
            'Podcasts i entrevistes',
            'Documentals i reportatges'
        ],
        learningStrategies: [
            'Busca el context històric o social dels temes',
            'Connecta els conceptes amb experiències pròpies',
            'Explica el que aprens a altres persones',
            'Busca exemples reals de cada concepte'
        ],
        uiPreferences: {
            theme: 'warm',
            conversationalTone: true,
            storytelling: true,
            examples: 'real-world',
            preferredFormat: 'narrative'
        }
    },

    LOGIKA: {
        id: 'logika',
        name: 'Logika',
        emoji: '🔢',
        color: '#3b82f6',
        description: 'Entén millor amb definicions, passos ordenats, taules i organització formal.',
        shortDescription: 'Analític',
        characteristics: [
            'Prefereix informació estructurada i ordenada',
            'Necessita passos clars i seqüències lògiques',
            'Analitza i compara abans de memoritzar',
            'Li agraden les taules, llistes i classificacions'
        ],
        contentRecommendations: [
            'Definicions formals i precises',
            'Taules comparatives',
            'Llistes ordenades pas a pas',
            'Esquemes jeràrquics',
            'Fórmules i regles',
            'Documentació tècnica estructurada'
        ],
        learningStrategies: [
            'Organitza la informació en esquemes jeràrquics',
            'Crea llistes de passos per a cada procés',
            'Compara conceptes amb taules',
            'Busca les regles i patrons de cada tema'
        ],
        uiPreferences: {
            theme: 'clean',
            structuredContent: true,
            stepByStep: true,
            typography: 'readable',
            preferredFormat: 'structured'
        }
    },

    PRAX: {
        id: 'prax',
        name: 'Prax',
        emoji: '🔧',
        color: '#f97316',
        description: 'Necessita fer, experimentar i interactuar per comprendre els conceptes.',
        shortDescription: 'Pràctic',
        characteristics: [
            'Aprèn fent i experimentant',
            'Necessita aplicar els conceptes immediatament',
            'Prefereix assaig-error a explicacions teòriques',
            'Es motiva amb resultats tangibles'
        ],
        contentRecommendations: [
            'Exercicis interactius',
            'Simulacions i laboratoris virtuals',
            'Projectes pràctics',
            'Tutorials pas a pas amb pràctica',
            'Activitats hands-on',
            'Reptes amb feedback immediat'
        ],
        learningStrategies: [
            'Practica mentre aprens, no després',
            'Busca exercicis i projectes reals',
            'Aprèn dels errors i experimenta',
            'Divideix projectes grans en tasques petites'
        ],
        uiPreferences: {
            theme: 'interactive',
            gamification: true,
            progressTracking: true,
            instantFeedback: true,
            preferredFormat: 'practical'
        }
    },

    KREO: {
        id: 'kreo',
        name: 'Kreo',
        emoji: '💡',
        color: '#ec4899',
        description: 'Aprèn explorant, plantejant idees noves i resolent reptes oberts.',
        shortDescription: 'Creatiu/Exploratori',
        characteristics: [
            'Prefereix explorar lliurement sense estructura rígida',
            'Genera idees pròpies i solucions originals',
            'Connecta conceptes de maneres inesperades',
            'Es motiva amb reptes oberts i creatius'
        ],
        contentRecommendations: [
            'Reptes creatius oberts',
            'Brainstorming i pluja d\'idees',
            'Projectes sense solució única',
            'Exploració lliure de recursos',
            'Connexions entre temes diferents',
            'Activitats de pensament lateral'
        ],
        learningStrategies: [
            'Planteja les teves pròpies preguntes',
            'Busca connexions amb altres matèries',
            'Crea projectes personals sobre el tema',
            'Explora camins alternatius abans de seguir l\'estàndard'
        ],
        uiPreferences: {
            theme: 'exploratory',
            nonLinearNavigation: true,
            relatedContent: true,
            creativeTools: true,
            preferredFormat: 'exploratory'
        }
    }
};

/**
 * Get profile by ID
 */
export const getProfileById = (id) => {
    return Object.values(LEARNING_PROFILES).find(profile => profile.id === id);
};

/**
 * Get all profiles
 */
export const getAllProfiles = () => {
    return Object.values(LEARNING_PROFILES);
};

/**
 * Get profile IDs
 */
export const getProfileIds = () => {
    return Object.values(LEARNING_PROFILES).map(p => p.id);
};

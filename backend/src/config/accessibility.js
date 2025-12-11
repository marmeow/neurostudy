/**
 * Accessibility Configuration - NeuroStudy AI
 * Preguntes d'accessibilitat per detectar necessitats específiques
 */

export const ACCESSIBILITY_QUESTIONS = {
    title: "Personalitza la teva experiència",
    description: "Respon aquestes preguntes perquè puguem adaptar la plataforma a les teves necessitats.",

    categories: {
        visual: {
            id: 'visual',
            name: 'Visió',
            icon: '👁️',
            questions: [
                {
                    id: 'acc_v1',
                    text: 'Tens dificultat per llegir textos petits?',
                    adaptation: 'largeText'
                },
                {
                    id: 'acc_v2',
                    text: 'Necessites més contrast per distingir bé els elements de la pantalla?',
                    adaptation: 'highContrast'
                },
                {
                    id: 'acc_v3',
                    text: 'Et costa distingir alguns colors?',
                    adaptation: 'colorBlindMode'
                }
            ]
        },
        auditory: {
            id: 'auditory',
            name: 'Audició',
            icon: '👂',
            questions: [
                {
                    id: 'acc_a1',
                    text: 'Et costa seguir explicacions només amb àudio?',
                    adaptation: 'subtitles'
                },
                {
                    id: 'acc_a2',
                    text: 'Prefereixes subtítols o transcripcions als vídeos?',
                    adaptation: 'subtitles'
                },
                {
                    id: 'acc_a3',
                    text: 'Tens alguna dificultat auditiva?',
                    adaptation: 'visualAlerts'
                }
            ]
        },
        motor: {
            id: 'motor',
            name: 'Mobilitat',
            icon: '🤚',
            questions: [
                {
                    id: 'acc_m1',
                    text: 'Et resulta complicat utilitzar botons petits?',
                    adaptation: 'largeButtons'
                },
                {
                    id: 'acc_m2',
                    text: 'Prefereixes navegar amb el teclat en lloc del ratolí?',
                    adaptation: 'keyboardNav'
                }
            ]
        },
        cognitive: {
            id: 'cognitive',
            name: 'Concentració',
            icon: '🧠',
            questions: [
                {
                    id: 'acc_c1',
                    text: 'Et distreus amb facilitat quan hi ha massa informació a la pantalla?',
                    adaptation: 'reducedMotion'
                },
                {
                    id: 'acc_c2',
                    text: 'Necessites textos més simples i directes?',
                    adaptation: 'simplifiedText'
                },
                {
                    id: 'acc_c3',
                    text: 'Et canses quan hi ha massa contingut seguit?',
                    adaptation: 'breakReminders'
                },
                {
                    id: 'acc_c4',
                    text: 'Necessites més temps per llegir o processar informació?',
                    adaptation: 'extendedTime'
                }
            ]
        }
    }
};

/**
 * Accessibility adaptations configuration
 */
export const ACCESSIBILITY_ADAPTATIONS = {
    largeText: {
        id: 'largeText',
        name: 'Text ampliat',
        description: 'Augmenta la mida del text per facilitar la lectura',
        cssClass: 'accessibility-large-text',
        cssVars: {
            '--font-size-base': '1.25rem',
            '--font-size-lg': '1.5rem',
            '--font-size-xl': '2rem'
        }
    },
    highContrast: {
        id: 'highContrast',
        name: 'Alt contrast',
        description: 'Millora el contrast entre colors',
        cssClass: 'accessibility-high-contrast',
        cssVars: {
            '--gray-300': '#ffffff',
            '--gray-400': '#e0e0e0',
            '--gray-500': '#c0c0c0'
        }
    },
    colorBlindMode: {
        id: 'colorBlindMode',
        name: 'Mode daltònic',
        description: 'Utilitza patrons i formes a més de colors',
        cssClass: 'accessibility-colorblind'
    },
    subtitles: {
        id: 'subtitles',
        name: 'Subtítols',
        description: 'Mostra subtítols en continguts d\'àudio i vídeo',
        feature: 'showSubtitles'
    },
    visualAlerts: {
        id: 'visualAlerts',
        name: 'Alertes visuals',
        description: 'Mostra notificacions visuals en lloc de sons',
        feature: 'visualAlerts'
    },
    largeButtons: {
        id: 'largeButtons',
        name: 'Botons grans',
        description: 'Augmenta la mida dels botons i àrees clicables',
        cssClass: 'accessibility-large-buttons',
        cssVars: {
            '--button-padding': '1.5rem 2rem',
            '--button-min-height': '60px'
        }
    },
    keyboardNav: {
        id: 'keyboardNav',
        name: 'Navegació per teclat',
        description: 'Millora la navegació amb teclat',
        cssClass: 'accessibility-keyboard-nav',
        feature: 'keyboardNavigation'
    },
    reducedMotion: {
        id: 'reducedMotion',
        name: 'Reduir moviment',
        description: 'Desactiva animacions i transicions',
        cssClass: 'accessibility-reduced-motion',
        cssVars: {
            '--transition-fast': '0ms',
            '--transition-normal': '0ms',
            '--transition-slow': '0ms'
        }
    },
    simplifiedText: {
        id: 'simplifiedText',
        name: 'Text simplificat',
        description: 'Utilitza llenguatge més senzill i directe',
        feature: 'simplifiedText'
    },
    breakReminders: {
        id: 'breakReminders',
        name: 'Recordatoris de descans',
        description: 'Et recorda fer pauses regulars',
        feature: 'breakReminders'
    },
    extendedTime: {
        id: 'extendedTime',
        name: 'Temps ampliat',
        description: 'Més temps per llegir i processar',
        feature: 'extendedTime'
    },
    textToSpeech: {
        id: 'textToSpeech',
        name: 'Lectura en veu alta',
        description: 'Llegeix el contingut en veu alta',
        feature: 'textToSpeech'
    }
};

/**
 * Process accessibility answers and return active adaptations
 */
export const processAccessibilityAnswers = (answers) => {
    const activeAdaptations = [];
    const allQuestions = Object.values(ACCESSIBILITY_QUESTIONS.categories)
        .flatMap(cat => cat.questions);

    for (const answer of answers) {
        if (answer.value === true) {
            const question = allQuestions.find(q => q.id === answer.questionId);
            if (question && question.adaptation) {
                const adaptation = ACCESSIBILITY_ADAPTATIONS[question.adaptation];
                if (adaptation && !activeAdaptations.find(a => a.id === adaptation.id)) {
                    activeAdaptations.push(adaptation);
                }
            }
        }
    }

    return activeAdaptations;
};

export default {
    ACCESSIBILITY_QUESTIONS,
    ACCESSIBILITY_ADAPTATIONS,
    processAccessibilityAnswers
};

/**
 * Questionnaire Configuration - NeuroStudy AI
 * 12 preguntes per determinar el perfil cognitiu
 */

export const QUESTIONNAIRE = {
    title: "Descobreix el teu Perfil d'Aprenentatge",
    description: "Respon les següents preguntes per descobrir com aprens millor. No hi ha respostes correctes ni incorrectes, simplement tria l'opció que et representa millor.",
    estimatedTime: "5-7 minuts",
    totalQuestions: 12,

    sections: [
        {
            id: "processing",
            title: "Com processes la informació",
            questions: [
                {
                    id: "q1",
                    text: "Com entens millor un concepte nou?",
                    options: [
                        { id: "a", text: "Amb un diagrama o vídeo que m'ho mostri", profiles: ["visualis"] },
                        { id: "b", text: "Amb una història o exemple real", profiles: ["narra"] },
                        { id: "c", text: "Amb una definició clara i passos ordenats", profiles: ["logika"] },
                        { id: "d", text: "Provant-ho o fent-ho jo mateix/a", profiles: ["prax"] },
                        { id: "e", text: "Explorant per mi compte i fent connexions", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q2",
                    text: "Quin tipus de contingut recordes millor?",
                    options: [
                        { id: "a", text: "Imatges, colors i esquemes", profiles: ["visualis"] },
                        { id: "b", text: "Històries i anècdotes", profiles: ["narra"] },
                        { id: "c", text: "Dades, llistes i taules", profiles: ["logika"] },
                        { id: "d", text: "El que he practicat o creat", profiles: ["prax"] },
                        { id: "e", text: "Idees que em van sorprendre o inspirar", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q3",
                    text: "Quin tipus d'explicació prefereixes?",
                    options: [
                        { id: "a", text: "Visual amb diagrames i il·lustracions", profiles: ["visualis"] },
                        { id: "b", text: "Narrativa amb context i exemples", profiles: ["narra"] },
                        { id: "c", text: "Tècnica amb passos i estructura clara", profiles: ["logika"] },
                        { id: "d", text: "Pràctica amb exercicis per fer", profiles: ["prax"] },
                        { id: "e", text: "Oberta que em deixi explorar", profiles: ["kreo"] }
                    ]
                }
            ]
        },
        {
            id: "habits",
            title: "Els teus hàbits d'estudi",
            questions: [
                {
                    id: "q4",
                    text: "Quan estudies, què fas espontàniament?",
                    options: [
                        { id: "a", text: "Faig dibuixos, esquemes o mapes", profiles: ["visualis"] },
                        { id: "b", text: "Busco exemples i casos reals", profiles: ["narra"] },
                        { id: "c", text: "Organitzo la informació en llistes", profiles: ["logika"] },
                        { id: "d", text: "Intento practicar el que estic aprenent", profiles: ["prax"] },
                        { id: "e", text: "M'allunyo del tema i hi torno amb idees noves", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q5",
                    text: "Quin ritme t'agrada seguir?",
                    options: [
                        { id: "a", text: "Modular: blocs visuals curts i variats", profiles: ["visualis"] },
                        { id: "b", text: "Fluid: una narrativa que em porti de principi a fi", profiles: ["narra"] },
                        { id: "c", text: "Seqüencial: pas a pas, ordenat", profiles: ["logika"] },
                        { id: "d", text: "Accelerat: vull arribar a la pràctica ràpid", profiles: ["prax"] },
                        { id: "e", text: "Lliure: sense pressa, explorant", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q6",
                    text: "Què t'ajuda més quan no entens un tema?",
                    options: [
                        { id: "a", text: "Veure un vídeo o infografia", profiles: ["visualis"] },
                        { id: "b", text: "Llegir un exemple o cas pràctic", profiles: ["narra"] },
                        { id: "c", text: "Tornar a llegir la definició amb calma", profiles: ["logika"] },
                        { id: "d", text: "Intentar fer-ho encara que m'equivoqui", profiles: ["prax"] },
                        { id: "e", text: "Buscar una perspectiva diferent", profiles: ["kreo"] }
                    ]
                }
            ]
        },
        {
            id: "preferences",
            title: "Les teves preferències",
            questions: [
                {
                    id: "q7",
                    text: "Quin tipus d'exemple et funciona millor?",
                    options: [
                        { id: "a", text: "Visual: gràfics, diagrames", profiles: ["visualis"] },
                        { id: "b", text: "Una història o situació real", profiles: ["narra"] },
                        { id: "c", text: "Una demostració amb passos clars", profiles: ["logika"] },
                        { id: "d", text: "Un exercici que pugui fer jo", profiles: ["prax"] },
                        { id: "e", text: "Un repte o problema a resoldre", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q8",
                    text: "Prefereixes veure, sentir o fer?",
                    options: [
                        { id: "a", text: "Veure: necessito imatges", profiles: ["visualis"] },
                        { id: "b", text: "Sentir: necessito connectar emocionalment", profiles: ["narra"] },
                        { id: "c", text: "Entendre: necessito lògica", profiles: ["logika"] },
                        { id: "d", text: "Fer: necessito practicar", profiles: ["prax"] },
                        { id: "e", text: "Crear: necessito inventar", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q9",
                    text: "Quina estructura t'agrada més: lliure o ordenada?",
                    options: [
                        { id: "a", text: "Visual però flexible", profiles: ["visualis"] },
                        { id: "b", text: "Com una història amb inici i final", profiles: ["narra"] },
                        { id: "c", text: "Molt ordenada i clara", profiles: ["logika"] },
                        { id: "d", text: "Orientada a objectius pràctics", profiles: ["prax"] },
                        { id: "e", text: "Totalment lliure", profiles: ["kreo"] }
                    ]
                }
            ]
        },
        {
            id: "motivation",
            title: "La teva motivació",
            questions: [
                {
                    id: "q10",
                    text: "Et motiva més la teoria o la pràctica?",
                    options: [
                        { id: "a", text: "Una mescla visual de teoria i pràctica", profiles: ["visualis"] },
                        { id: "b", text: "Teoria aplicada a casos reals", profiles: ["narra"] },
                        { id: "c", text: "Teoria ben explicada abans de practicar", profiles: ["logika"] },
                        { id: "d", text: "Pràctica primer, teoria després", profiles: ["prax"] },
                        { id: "e", text: "Cap de les dues: prefereixo explorar", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q11",
                    text: "Necessites entendre el context abans del concepte?",
                    options: [
                        { id: "a", text: "Necessito veure el panorama general visualment", profiles: ["visualis"] },
                        { id: "b", text: "Sí, necessito el context i la història", profiles: ["narra"] },
                        { id: "c", text: "No, prefereixo anar directe al concepte", profiles: ["logika"] },
                        { id: "d", text: "Prefereixo veure què he de fer primer", profiles: ["prax"] },
                        { id: "e", text: "M'agrada descobrir el context mentre exploro", profiles: ["kreo"] }
                    ]
                },
                {
                    id: "q12",
                    text: "T'agrada crear idees pròpies encara que no siguin estructurades?",
                    options: [
                        { id: "a", text: "Sí, sobretot si les puc visualitzar", profiles: ["visualis"] },
                        { id: "b", text: "Sí, si les puc connectar amb experiències", profiles: ["narra"] },
                        { id: "c", text: "Prefereixo seguir mètodes provats", profiles: ["logika"] },
                        { id: "d", text: "Sí, però m'agrada provar-les ràpid", profiles: ["prax"] },
                        { id: "e", text: "Sí! És el que més m'agrada", profiles: ["kreo"] }
                    ]
                }
            ]
        }
    ]
};

/**
 * Calculate profile from answers (fallback method)
 */
export const calculateProfileFromAnswers = (answers) => {
    const profileScores = {
        'visualis': 0,
        'narra': 0,
        'logika': 0,
        'prax': 0,
        'kreo': 0
    };

    // Count profile occurrences from answers
    for (const answer of answers) {
        if (answer.profiles) {
            for (const profile of answer.profiles) {
                if (profileScores.hasOwnProperty(profile)) {
                    profileScores[profile]++;
                }
            }
        }
    }

    // Find the dominant profiles
    const sortedProfiles = Object.entries(profileScores)
        .sort(([, a], [, b]) => b - a);

    const primaryScore = sortedProfiles[0][1];
    const secondaryScore = sortedProfiles[1][1];

    // Check if it's a hybrid profile (two profiles very close)
    const isHybrid = primaryScore > 0 && secondaryScore > 0 &&
        (primaryScore - secondaryScore) <= 2;

    return {
        primaryProfile: sortedProfiles[0][0],
        secondaryProfile: sortedProfiles[1][0],
        scores: profileScores,
        confidence: answers.length > 0 ? Math.round((primaryScore / answers.length) * 100) : 0,
        isHybrid
    };
};

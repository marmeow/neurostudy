<!-- App.vue - Component principal de l'aplicació -->

<script setup>
import { ref, onMounted } from 'vue'
import WelcomeScreen from './components/WelcomeScreen.vue'
import AccessibilityForm from './components/AccessibilityForm.vue'
import Questionnaire from './components/Questionnaire.vue'
import ProfileResult from './components/ProfileResult.vue'
import Chat from './components/Chat.vue'

// === ESTAT DE L'APLICACIÓ ===
// Controla quina pantalla es mostra: 'welcome', 'accessibility', 'questionnaire', 'result'
const pantallaActual = ref('welcome')

// Guarda el resultat del perfil de l'usuari
const resultatPerfil = ref(null)

// Controla si està carregant
const estaCarregant = ref(false)

// Guarda missatges d'error
const missatgeError = ref(null)

// Controla si el xat està obert
const xatObert = ref(false)

// === CONFIGURACIÓ D'ACCESSIBILITAT ===
// Guarda les respostes del formulari d'accessibilitat
const configuracioAccessibilitat = ref({})

// Guarda les adaptacions actives (text gran, alt contrast, etc.)
const adaptacionsActives = ref([])

// URL de l'API del backend
const URL_API = 'http://localhost:3000/api'

// === FUNCIONS D'ACCESSIBILITAT ===

/**
 * Aplica les adaptacions d'accessibilitat a tota la pàgina
 * @param {Array} adaptacions - Llista d'adaptacions a aplicar
 */
const aplicarEstilsGlobals = (adaptacions) => {
  const elementHTML = document.documentElement

  // Netegem les classes antigues d'accessibilitat
  const classesAntigues = Array.from(elementHTML.classList).filter(cls =>
    cls.startsWith('accessibility-')
  )
  classesAntigues.forEach(cls => elementHTML.classList.remove(cls))

  // Netegem els estils anteriors
  elementHTML.style.cssText = ''

  // Apliquem cada adaptació
  adaptacions.forEach(adaptacio => {
    // Afegim la classe CSS si n'hi ha
    if (adaptacio.cssClass) {
      elementHTML.classList.add(adaptacio.cssClass)
    }

    // Apliquem variables CSS (colors, mides, etc.)
    if (adaptacio.cssVars) {
      for (const [variable, valor] of Object.entries(adaptacio.cssVars)) {
        elementHTML.style.setProperty(variable, valor)
      }
    }
  })
}

// Quan es carrega la pàgina, recuperem les adaptacions guardades
onMounted(() => {
  const adaptacionsGuardades = localStorage.getItem('activeAdaptations')
  if (adaptacionsGuardades) {
    try {
      const adaptacions = JSON.parse(adaptacionsGuardades)
      adaptacionsActives.value = adaptacions
      aplicarEstilsGlobals(adaptacions)
    } catch (e) {
      console.error('Error carregant adaptacions:', e)
      localStorage.removeItem('activeAdaptations')
    }
  }
})

// === NAVEGACIÓ ENTRE PANTALLES ===

// Inicia l'avaluació (va a la pantalla d'accessibilitat)
const iniciarAvaluacio = () => {
  pantallaActual.value = 'accessibility'
}

// Quan es completa el formulari d'accessibilitat
const accessibilitatCompleta = (dades) => {
  configuracioAccessibilitat.value = dades.answers || {}
  adaptacionsActives.value = dades.adaptations || []

  // Apliquem i guardem les adaptacions
  aplicarEstilsGlobals(adaptacionsActives.value)
  localStorage.setItem('activeAdaptations', JSON.stringify(adaptacionsActives.value))

  pantallaActual.value = 'questionnaire'
}

// Si l'usuari salta el pas d'accessibilitat
const saltarAccessibilitat = () => {
  adaptacionsActives.value = []
  aplicarEstilsGlobals([])
  localStorage.removeItem('activeAdaptations')
  pantallaActual.value = 'questionnaire'
}

// Quan es completa el qüestionari
const questionariComplet = async (respostes) => {
  estaCarregant.value = true
  missatgeError.value = null

  try {
    // Enviem les respostes a l'API
    const response = await fetch(`${URL_API}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: respostes })
    })

    const dades = await response.json()

    if (dades.success) {
      resultatPerfil.value = dades.data
      pantallaActual.value = 'result'
    } else {
      missatgeError.value = dades.error || 'Error al analitzar les respostes'
    }
  } catch (err) {
    console.error('Error:', err)
    missatgeError.value = 'Error de connexió amb el servidor'
  } finally {
    estaCarregant.value = false
  }
}

// Reinicia l'avaluació
const reiniciarAvaluacio = () => {
  resultatPerfil.value = null
  xatObert.value = false
  pantallaActual.value = 'welcome'
}

// Obre/tanca el xat
const obrirXat = () => {
  xatObert.value = true
}

const tancarXat = () => {
  xatObert.value = false
}
</script>

<template>
  <div class="app">
    <!-- Enllaç per saltar al contingut (accessibilitat) -->
    <a href="#main-content" class="skip-link">Saltar contingut principal</a>

    <!-- Decoracions de fons -->
    <div class="decoracio-fons" aria-hidden="true">
      <div class="cercle cercle-1"></div>
      <div class="cercle cercle-2"></div>
      <div class="cercle cercle-3"></div>
    </div>

    <!-- Capçalera -->
    <header class="capsalera">
      <div class="container">
        <div class="contingut-capsalera">
          <!-- Logo -->
          <div 
            class="logo" 
            @click="reiniciarAvaluacio" 
            role="button" 
            tabindex="0" 
            @keydown.enter="reiniciarAvaluacio"
          >
            <img src="/logo.png" alt="logo">
          </div>

          <!-- Accions de la capçalera -->
          <div class="accions-capsalera">
            <!-- Indicador d'accessibilitat activa -->
            <p class="eslogan">Tecnologia amb empatia</p>
          </div>
        </div>
      </div>
    </header>

    <!-- Contingut principal -->
    <main class="contingut-principal" id="main-content">
      <div class="container container-sm">
        
        <!-- Estat de càrrega -->
        <div v-if="estaCarregant" class="estat-carregant" role="status" aria-live="polite">
          <div class="spinner" aria-hidden="true"></div>
          <p>Analitzant el teu perfil d'aprenentatge...</p>
          <p class="text-petit">La nostra IA està processant les teves respostes</p>
        </div>

        <!-- Estat d'error -->
        <div v-else-if="missatgeError" class="estat-error card" role="alert">
          <span class="icona-error" aria-hidden="true">⚠️</span>
          <h3>S'ha produït un error</h3>
          <p>{{ missatgeError }}</p>
          <button 
            class="btn btn-primary mt-lg" 
            @click="missatgeError = null; pantallaActual = 'questionnaire'"
          >
            Tornar a intentar
          </button>
        </div>

        <!-- Pantalles (amb transició) -->
        <Transition name="fade" mode="out-in">
          <!-- Pantalla de benvinguda -->
          <WelcomeScreen 
            v-if="pantallaActual === 'welcome' && !estaCarregant && !missatgeError" 
            :key="'welcome'"
            @start="iniciarAvaluacio" 
          />

          <!-- Formulari d'accessibilitat -->
          <AccessibilityForm 
            v-else-if="pantallaActual === 'accessibility' && !estaCarregant && !missatgeError" 
            :key="'accessibility'"
            @complete="accessibilitatCompleta" 
            @skip="saltarAccessibilitat" 
          />

          <!-- Qüestionari -->
          <Questionnaire 
            v-else-if="pantallaActual === 'questionnaire' && !estaCarregant && !missatgeError" 
            :key="'questionnaire'"
            @complete="questionariComplet" 
            @back="pantallaActual = 'accessibility'" 
          />

          <!-- Resultat del perfil -->
          <div 
            v-else-if="pantallaActual === 'result' && !estaCarregant && !missatgeError" 
            :key="'result'" 
            class="contenidor-resultat"
          >
            <ProfileResult 
              :result="resultatPerfil" 
              @restart="reiniciarAvaluacio" 
            />

            <!-- Botó flotant del xat -->
            <div class="contenidor-boto-xat" v-if="!xatObert">
              <button class="boto-xat-flotant" @click="obrirXat" aria-label="Obrir xat amb IA">
                <span class="icona-xat">💬</span>
                <span class="text-xat">Xat amb IA</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Panel del xat -->
      <Transition name="slide-up">
        <div v-if="xatObert && resultatPerfil" class="panel-xat">
          <Chat 
            :profileId="resultatPerfil.primaryProfile" 
            :profileDetails="resultatPerfil.primaryProfileDetails"
            :accessibilitySettings="configuracioAccessibilitat" 
            @close="tancarXat" 
          />
        </div>
      </Transition>
    </main>

    <!-- Peu de pàgina -->
    <footer class="peu-pagina">
      <div class="container">
        <p>© 2024 NeuroStudy AI - Tecnologia amb empatia</p>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

/* Decoracions de fons */
.decoracio-fons {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.cercle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.3;
}

.cercle-1 {
  width: 600px;
  height: 600px;
  background: var(--primary-500);
  top: -200px;
  right: -200px;
  animation: flotar 8s ease-in-out infinite;
}

.cercle-2 {
  width: 400px;
  height: 400px;
  background: var(--accent-purple);
  bottom: -100px;
  left: -100px;
  animation: flotar 10s ease-in-out infinite reverse;
}

.cercle-3 {
  width: 300px;
  height: 300px;
  background: var(--accent-teal);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: palpitar 5s ease-in-out infinite;
}

@keyframes flotar {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes palpitar {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.5; }
}

/* Capçalera */
.capsalera {
  position: relative;
  z-index: 10;
  padding: 24px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
}

.contingut-capsalera {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.accions-capsalera {
  display: flex;
  align-items: center;
  gap: 16px;
}

.indicador-accessibilitat {
  padding: 8px 16px;
  background: rgba(139, 92, 246, 0.2);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 50px;
  color: var(--accent-purple);
  font-size: 0.75rem;
  cursor: pointer;
}

.logo {
  cursor: pointer;
  transition: transform 0.2s;
}

.logo img {
  width: 30%;
  height: auto;
}

.logo:hover {
  transform: scale(1.02);
}

.eslogan {
  font-size: 0.875rem;
  color: var(--gray-400);
  font-style: italic;
}

/* Contingut principal */
.contingut-principal {
  flex: 1;
  position: relative;
  z-index: 10;
  padding: 80px 0;
  display: flex;
  align-items: center;
}

.contenidor-resultat {
  width: 100%;
}

/* Estats de càrrega i error */
.estat-carregant {
  text-align: center;
  padding: 80px;
}

.spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--gray-700);
  border-top-color: var(--primary-500);
  border-radius: 50%;
  margin: 0 auto 32px;
  animation: girar 1s linear infinite;
}

@keyframes girar {
  to { transform: rotate(360deg); }
}

.estat-carregant p {
  font-size: 1.25rem;
  color: white;
  margin-bottom: 8px;
}

.text-petit {
  font-size: 0.875rem !important;
  color: var(--gray-400) !important;
}

.estat-error {
  text-align: center;
  padding: 64px;
}

.icona-error {
  font-size: 3rem;
  display: block;
  margin-bottom: 24px;
}

/* Botó flotant del xat */
.contenidor-boto-xat {
  position: fixed;
  bottom: 64px;
  right: 64px;
  z-index: 100;
}

.boto-xat-flotant {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, var(--primary-500), var(--accent-purple));
  border: none;
  border-radius: 50px;
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
  transition: all 0.3s;
}

.boto-xat-flotant:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 30px rgba(139, 92, 246, 0.5);
}

.icona-xat {
  font-size: 1.25rem;
}

/* Panel del xat */
.panel-xat {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 400px;
  height: 600px;
  z-index: 200;
}

/* Peu de pàgina */
.peu-pagina {
  position: relative;
  z-index: 10;
  padding: 24px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  text-align: center;
}

.peu-pagina p {
  font-size: 0.875rem;
  color: var(--gray-500);
}

/* Transicions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.4s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Responsive */
@media (max-width: 768px) {
  .contingut-capsalera {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .accions-capsalera {
    flex-direction: column;
  }

  .eslogan {
    display: none;
  }

  .panel-xat {
    width: calc(100% - 48px);
    height: 70vh;
    bottom: 0;
    right: 0;
    left: 0;
    margin: 0 auto;
  }

  .contenidor-boto-xat {
    bottom: 24px;
    right: 24px;
  }

  .text-xat {
    display: none;
  }

  .boto-xat-flotant {
    padding: 16px;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    justify-content: center;
  }

  .icona-xat {
    font-size: 1.5rem;
  }
}
</style>
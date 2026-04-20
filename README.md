```markdown
# Hand Shape Controller - Ultimate Edition

## 📖 Description
Application web qui contrôle une **forme 3D** (cube, sphère, torus, cône, etc.) avec vos **mains** via webcam.  
**MediaPipe** pour la détection des mains + **Three.js** pour le rendu 3D. Interface dark/light ultra fluide

## ✨ Fonctionnalités

- **🎮 Contrôle gestuel complet** :
  - **Index** → Déplacement
  - **2 doigts** → Rotation  
  - **Pince →** → Zoom in
  - **Pince ←** → Zoom out
  - **Poing** → Reset total

- **🧩 7 formes 3D** : Cube, Sphère, Torus, Cône, Octaèdre, Nœud Torus
- **🎨 8 couleurs** : Cyan, Rose, Violet, Orange, Bleu, Rouge, Blanc, Lime
- **🌙 Dark/Light mode** (auto-save)
- **📊 Stats temps réel** : FPS, latence MediaPipe, détections
- **⌨️ Raccourcis** : `Ctrl+D` Debug, `Ctrl+H` High Perf, `Ctrl+E` Export JSON

## 🛠️ Technologies
| Tech | Rôle |
|------|------|
| **Three.js r134** | Rendu 3D + éclairage dynamique |
| **MediaPipe Hands** | Détection 21 landmarks/main |
| **DM Mono (Google Fonts)** | Typo monospace premium |
| **CSS Grid + Flexbox** | Layout responsive parfait |

## 🚀 Installation (1 fichier !)
```bash
git clone <repo>
# Ou juste drag & drop index.html
# Ouvrir dans navigateur (HTTPS requis pour webcam)
```

## 🎯 Utilisation rapide
```
1. Cliquez "DÉMARRER CAMÉRA"
2. Choisissez forme + couleur 
3. 🤲 Faites des gestes magiques
4. Stats en temps réel à droite
```

## ⚙️ Configuration avancée
```javascript
// Dans le code (CONFIG object)
PINCHTHRESHOLD: 0.25,    // Sensibilité pince
ZOOMSENSITIVITY: 8,       // Vitesse zoom  
ROTATIONSENSITIVITY: 25,  // Rotation doigts
HIGHPERFMODE: false,      // Mode 60fps+
DEBUGMODE: false          // Stats techniques
```

## 📱 Responsive Design
| Écran | Adaptation |
|-------|------------|
| **Desktop** | Panneau latéral fixe |
| **Tablet** | Panneau rétractable |
| **Mobile** | Interface full-screen |

## 🎪 Contrôles Gestes
| Geste | Action | Feedback |
|-------|--------|----------|
| **✋ Index** | Déplacer X/Y | Badge "DÉPLACER" |
| **✌️ 2 doigts** | Rotation | Badge "ROTATION" |
| **👌 Pince →** | Zoom + | Flèche ↑ verte |
| **👌 Pince ←** | Zoom - | Flèche ↓ verte |
| **✊ Poing** | Reset 0 | Retour origine |

## 🔍 Stats affichées
```
✅ FPS (60 max)
✅ Latence MediaPipe (ms)
✅ Taux détection (%)
✅ Position X/Y monde
✅ Distance pince
✅ Échelle 3D
✅ Geste détecté
✅ Session (temps/détections)
```

## ⚠️ Prérequis
- **HTTPS obligatoire** (webcam)
- **Webcam frontale** recommandée
- **Chrome/Edge** = perf max
- **1 seule main** (configurée)

## 🚀 Prêt GitHub
```
💾 Un seul fichier index.html (50ko)
✅ Zéro dépendances npm
✅ CDN Three.js + MediaPipe
✅ PWA-ready (theme-color)
✅ Mobile-first design
✅ Export sessions JSON
```

**Ton contrôleur 3D par gestes est prêt pour GitHub Stars ! 🌟✨**
```

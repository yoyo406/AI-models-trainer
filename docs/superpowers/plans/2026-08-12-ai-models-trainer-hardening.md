# AI Models Trainer Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Réduire les risques de crash et de perte de données du trainer navigateur, renforcer la sécurité des dépendances et améliorer la fiabilité des métriques, checkpoints et tests.

**Architecture:** Conserver le déploiement statique GitHub Pages et l’architecture TensorFlow.js/Web Worker existante afin de limiter le risque. Remplacer les allocations de loss inutiles, durcir les validations et le stockage, puis extraire les dépendances runtime vers des fichiers locaux versionnés avec un worker résoluble depuis le chemin de l’application.

**Tech Stack:** HTML/CSS/JavaScript navigateur, TensorFlow.js 4.22.0, Web Worker, IndexedDB, Service Worker, Node.js built-in test runner.

## Global Constraints

- Ne pas lancer d’entraînement GPU lourd.
- Ne pas modifier les autres projets du workspace.
- Préserver le format de checkpoint schema 3 pour la compatibilité existante.
- Ne pas introduire de dépendance npm nécessaire à l’exécution de l’application statique.
- Toute nouvelle validation doit refuser les valeurs non finies, les dimensions impossibles et les ressources dépassant les limites navigateur.

---

### Task 1: Ajouter les régressions ciblées et les scripts de test légers

**Files:**
- Modify: `tests/audit-smoke.test.cjs`
- Create: `package.json`

**Interfaces:**
- Les tests extraient toujours les helpers du worker embarqué sans initialiser TensorFlow.js.
- Les nouveaux helpers testables sont `sparseLossSource`, `estimateLoadSource`, `validateCheckpoint`, `normalizeTemperature` et `clearLocalStateSource` via assertions de comportement/source.

- [ ] **Step 1: Write the failing tests**

Ajouter des assertions qui échouent sur l’état actuel : la loss ne doit plus utiliser `tf.oneHot`, l’estimation ne doit plus diviser par le nombre de têtes, la température invalide doit revenir à une valeur finie, les vocabulaires dupliqués doivent être refusés, et la suppression locale doit viser le corpus et le checkpoint.

- [ ] **Step 2: Run the targeted test command and confirm the expected failures**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: échec uniquement sur les nouvelles assertions, sans entraînement ni téléchargement réseau.

- [ ] **Step 3: Add the minimal test script**

Créer un `package.json` sans dépendance avec un script `test` égal à `node --test tests/audit-smoke.test.cjs`.

- [ ] **Step 4: Run the targeted test command again**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: les tests existants restent verts et les nouvelles assertions restent rouges jusqu’aux tâches suivantes.

---

### Task 2: Réduire la mémoire de la loss et durcir le sampler

**Files:**
- Modify: `docs/index.html`
- Modify: `tests/audit-smoke.test.cjs`

**Interfaces:**
- `MiniGPT.lossAndLogits(idx, targets)` conserve sa signature et retourne une loss scalaire.
- `sampleFromDistribution(probs, topK, topP)` accepte uniquement des probabilités finies et revient à l’argmax si le calcul est invalide.
- `normalizeTemperature(value)` retourne une température finie comprise entre `0.05` et `2`.

- [ ] **Step 1: Implement sparse cross-entropy**

Remplacer `tf.oneHot(flatTargets, V)` par une sélection des log-probabilités correspondant aux cibles via `tf.gatherND`, puis moyenner la négation. La forme de sortie et la compatibilité TensorFlow.js doivent rester inchangées.

- [ ] **Step 2: Harden sampling and temperature handling**

Filtrer les probabilités non finies ou négatives, normaliser le cas où la somme est nulle et borner la température avant la division des logits.

- [ ] **Step 3: Run targeted tests**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: les tests de loss/sampler passent sans initialiser de backend GPU.

---

### Task 3: Durcir la validation, l’import et l’export des checkpoints

**Files:**
- Modify: `docs/index.html`
- Modify: `tests/audit-smoke.test.cjs`

**Interfaces:**
- Schema 3 reste accepté.
- Les checkpoints dépassant une limite de valeurs et une limite de tokens sont refusés avant allocation.
- Les vocabulaires doivent être uniques et contenir un token explicite `<UNK>` ajouté par l’application.

- [ ] **Step 1: Add failing validation cases**

Tester un vocabulaire dupliqué, une température non finie et un checkpoint dépassant la limite défensive.

- [ ] **Step 2: Implement validation and unknown-token support**

Valider le tokenizer, l’unicité du vocabulaire, les limites de taille, reconstruire les tables d’index localement et utiliser `<UNK>` pour les tokens absents. Préserver les checkpoints existants en ajoutant `<UNK>` uniquement aux nouveaux entraînements, sans modifier les poids importés schema 3.

- [ ] **Step 3: Reduce checkpoint memory spikes**

Limiter la taille des imports côté fichier avant `file.text()`, déplacer la validation et la conversion vers le worker quand c’est possible, libérer les références temporaires après export/import et afficher un message explicite en cas de dépassement.

- [ ] **Step 4: Run targeted tests**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: les checkpoints valides passent, les entrées dupliquées ou trop volumineuses sont rejetées.

---

### Task 4: Corriger la sécurité GPU, la charge estimée et les métriques importées

**Files:**
- Modify: `docs/index.html`
- Modify: `tests/audit-smoke.test.cjs`

**Interfaces:**
- `estimateLoad(cfg)` reste compatible avec l’interface de sécurité mais reflète le coût attentionnel `batch × contexte² × embedding × layers` et inclut une composante paramètres/vocabulaire.
- L’import met à jour `STATE.stats` et remet les métriques UI à l’état du checkpoint importé.

- [ ] **Step 1: Add failing estimator/import assertions**

Vérifier que doubler `n_heads` ne divise pas artificiellement le score et qu’un import ne conserve pas les métriques du modèle précédent.

- [ ] **Step 2: Implement conservative resource estimation**

Retirer la division par `nHeads`, ajouter la taille approximative des paramètres, les slots AdamW et les logits, puis ajuster les seuils pour conserver des avertissements prudents sur les appareils modestes.

- [ ] **Step 3: Restore and display checkpoint stats**

Restaurer `STATE.stats` dans le worker et actualiser les champs de métriques lors d’un import, avec des valeurs neutres quand les statistiques ne sont pas présentes.

- [ ] **Step 4: Run targeted tests**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: aucune régression sur le parsing ou les tests de checkpoint.

---

### Task 5: Corriger la persistance locale et la concurrence IndexedDB

**Files:**
- Modify: `docs/index.html`
- Modify: `tests/audit-smoke.test.cjs`

**Interfaces:**
- `clearAutosave()` supprime le checkpoint et le corpus persistant, puis confirme la suppression.
- Les écritures IndexedDB sont sérialisées par une promesse partagée afin qu’une suppression ne soit pas ré-écrite par un autosave retardé.

- [ ] **Step 1: Add failing storage assertions**

Tester la présence des deux clés de suppression et de la file d’écriture sérialisée.

- [ ] **Step 2: Implement serialized writes and complete clear**

Ajouter une chaîne `storageWriteQueue`, faire passer `saveAutosave`, `saveTrainingText` et `clearAutosave` par cette chaîne, supprimer `latest` et `trainingText` dans une transaction unique et renommer le libellé UI en “Clear local data”.

- [ ] **Step 3: Run targeted tests**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: les tests statiques passent sans ouvrir IndexedDB réel.

---

### Task 6: Vendre TensorFlow.js localement et améliorer le PWA

**Files:**
- Create: `docs/vendor/tf.min.js`
- Create: `docs/vendor/tf-backend-webgpu.min.js`
- Modify: `docs/index.html`
- Modify: `docs/service-worker.js`
- Modify: `README.md`

**Interfaces:**
- L’application charge les versions locales exactes de TensorFlow.js 4.22.0.
- Le worker reçoit des URL locales absolues compatibles avec GitHub Pages et n’utilise plus de CDN à l’exécution.
- Le Service Worker met en cache les scripts vendorisés.

- [ ] **Step 1: Download the pinned vendor assets**

Récupérer uniquement les deux fichiers jsDelivr correspondant à TensorFlow.js 4.22.0 et vérifier leurs tailles et empreintes SHA-384.

- [ ] **Step 2: Replace runtime CDN URLs**

Charger les scripts locaux avec `integrity` et `crossorigin`, et interpoler leur URL résolue depuis `document.baseURI` dans le source du worker.

- [ ] **Step 3: Update offline cache and documentation**

Ajouter les deux assets à `ASSETS_TO_CACHE`, corriger le commentaire de stratégie cache, et documenter que le runtime est local.

- [ ] **Step 4: Run static tests only**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: validation des ressources locales et du manifeste, sans lancer TensorFlow.js.

---

### Task 7: Fiabiliser l’expérience ML et la maintenabilité

**Files:**
- Modify: `docs/index.html`
- Modify: `README.md`
- Modify: `AUDIT_REPORT.md`
- Modify: `tests/audit-smoke.test.cjs`

**Interfaces:**
- Le niveau char utilise des code points Unicode.
- L’entraînement accepte une seed persistée et affiche une métrique de validation lorsque le corpus le permet.
- La génération limite le tri complet et documente l’absence de KV cache si elle reste nécessaire.

- [ ] **Step 1: Add targeted source tests**

Tester la tokenisation Unicode, la présence d’une seed d’entraînement, la séparation validation et la correction du nombre de tests documenté.

- [ ] **Step 2: Implement deterministic training and validation metrics**

Ajouter un PRNG seedé côté worker, séparer une portion fixe des offsets pour l’évaluation, calculer une loss validation périodique et utiliser cette métrique pour l’early stopping.

- [ ] **Step 3: Improve generation robustness**

Utiliser une sélection partielle lorsque `topK` est activé, borner la longueur et la température côté worker et conserver `textContent` pour empêcher toute injection dans l’output.

- [ ] **Step 4: Update documentation and audit report**

Documenter les limites réelles, la seed, la validation et le nombre exact de tests.

- [ ] **Step 5: Run the lightweight final verification**

Run: `node --test tests/audit-smoke.test.cjs`

Expected: zéro échec, aucune commande d’entraînement GPU exécutée.

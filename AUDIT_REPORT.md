# Rapport d’audit

## Périmètre et architecture

Tous les fichiers du projet ont été inspectés. L’application est une page statique sans
build : `docs/index.html` contient l’interface, le contrôleur principal et la source du
Web Worker. Le worker charge TensorFlow.js 4.22.0, sélectionne WebGPU puis WebGL, entraîne
le modèle et gère les checkpoints. IndexedDB conserve le corpus et l’autosave ;
`service-worker.js`, `manifest.json` et les deux icônes fournissent l’enveloppe PWA.

## Corrections effectuées

- Cycle de vie du worker : invalidation après panne ou timeout, rejet immédiat des
  requêtes pendantes, remplacement sûr et corrélation de la réponse `reset`.
- Robustesse GPU : test d’allocation réel avant d’accepter WebGPU, repli WebGL sur les
  erreurs `GPUDevice/createBuffer`, noms de variables uniques et construction
  transactionnelle sans variables TensorFlow orphelines après un échec partiel.
- Concurrence : sérialisation des actions UI, reset sûr pendant l’entraînement et
  prévention des imports, exports ou générations concurrents.
- Calcul : conservation des valeurs numériques `0`, bornage des paramètres, contexte
  limité au corpus, correction du dernier offset de batch, loss sparse sans tenseur
  one-hot, détection des pertes non finies et libération systématique des tenseurs de
  gradient.
- Génération : suppression du faux padding de contexte et correction de la lecture
  asynchrone d’un tenseur dans `tf.tidy()`.
- Checkpoints : schéma 3 strict, dimensions et tenseurs validés, valeurs non finies
  refusées, vocabulaire reconstruit sans faire confiance aux tables importées, entrées
  dupliquées refusées, tables de lookup redondantes retirées des nouveaux exports et
  limite défensive à 40 millions de valeurs.
- UI : états de boutons cohérents, erreurs et chargements visibles, paramètres ajustés
  resynchronisés, persistance de la graine réparée et redimensionnement du graphe limité
  à une frame.
- Accessibilité : relations onglet/panneau, navigation fléchée/Home/End, libellés de
  contrôles, progression ARIA, canvas décrit, icônes décoratives masquées et orientation
  non imposée par le manifeste.
- PWA : manifeste enfin lié, service worker enregistré, documents en network-first et
  ressources locales en stale-while-revalidate correctement rattachées à l’événement ;
  TensorFlow.js 4.22.0 est maintenant vendorié localement, protégé par SRI et précaché.
- Expérience ML : seed d’entraînement reproductible, split validation lorsque le corpus
  le permet, loss validation affichée et métriques de checkpoint restaurées.
- Stockage : écritures IndexedDB sérialisées et bouton de suppression étendu au corpus
  d’entraînement local.
- Nettoyage : état mort supprimé, sélecteurs inutilisés retirés, documentation corrigée.

## Vérifications

- `node --test tests/audit-smoke.test.cjs` : 16 tests réussis.
- Syntaxe JavaScript embarquée, worker, service worker et JSON validée.
- Ressources du manifeste et dimensions des icônes validées.
- Navigateur réel : WebGPU prêt, entraînement court terminé, génération réussie, reset
  concurrent réussi, contexte trop grand ajusté, persistance et navigation clavier
  vérifiées.
- Viewports 375×812 et desktop : aucune barre de défilement horizontale ; navigation
  adaptative horizontale/verticale correcte.
- Console navigateur : aucune erreur après les scénarios finaux.

## Limites et risques restants

- `index.html` reste monolithique. Le découper améliorerait la maintenabilité, mais
  changerait le chargement statique et le fallback worker ; cette refonte n’est pas
  justifiée dans une correction à faible risque.
- Le runtime TensorFlow.js est vendorié dans `docs/vendor/` avec des empreintes SRI et
  précaché par le service worker. Toute mise à jour doit changer les empreintes et le
  nom de cache du service worker ensemble.
- Les très gros checkpoints JSON peuvent encore provoquer un pic mémoire pendant
  `file.text()`, `JSON.parse()` ou `JSON.stringify()`. La limite d’import est maintenant
  de 128 Mo et les tables redondantes ne sont plus exportées, mais un format binaire
  reste préférable pour de très gros modèles.
- Les performances et limites mémoire dépendent fortement du navigateur, du pilote et
  du GPU ; elles ne peuvent pas être garanties par un test sur une seule machine.
- Le fallback `FakeWorker` exécute volontairement l’entraînement sur le thread principal
  lorsque les workers Blob sont interdits. C’est un compromis fonctionnel documenté,
  pas une voie recommandée pour les gros modèles.

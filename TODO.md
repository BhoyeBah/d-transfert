# Cahier des charges fonctionnel complet — D-Transfert

## 1. Présentation générale du projet

### 1.1 Nom du projet

**D-Transfert**

### 1.2 Nature du projet

D-Transfert est une plateforme web et mobile destinée aux entreprises, agents, points multiservices et collaborateurs qui effectuent des opérations de transfert d’argent, de paiement, de dépôt, de retrait, de gestion de wallets et de suivi de dettes entre partenaires.

La plateforme permet de remplacer les suivis manuels effectués par WhatsApp, cahiers, captures d’écran ou fichiers Excel, en centralisant toutes les opérations dans un système fiable, traçable et sécurisé.

D-Transfert n’est pas forcément un agrégateur de paiement au démarrage. La plateforme sert principalement à enregistrer, contrôler, suivre, valider et équilibrer les transactions réalisées physiquement ou via des wallets externes comme Orange Money, Wave, cash, banques, mobile money ou autres moyens de paiement.

---

## 2. Objectif principal

L’objectif principal de D-Transfert est de permettre à plusieurs entreprises ou collaborateurs de gérer leurs transactions nationales et internationales avec un système de solde partagé, des validations croisées, des taux de change bien séparés, des preuves de paiement et un historique complet.

La plateforme doit permettre de savoir clairement :

* Qui doit de l’argent à qui.
* Quel montant a été reçu.
* Quel montant a été envoyé.
* Quel montant a été payé.
* Quel wallet a été utilisé.
* Quel taux a été appliqué.
* Quelle preuve a été fournie.
* Quel collaborateur a validé ou rejeté l’opération.
* Quel solde reste entre deux partenaires.

---

## 3. Problème à résoudre

Aujourd’hui, beaucoup d’acteurs du transfert d’argent en Afrique travaillent de manière informelle ou semi-formelle. Les opérations sont souvent gérées par WhatsApp, appels téléphoniques, notes écrites ou fichiers Excel.

Cela crée plusieurs problèmes :

* Erreurs de calcul entre collaborateurs.
* Difficulté à suivre les soldes.
* Manque de preuve centralisée.
* Conflits sur les taux utilisés.
* Confusion entre taux d’envoi et taux de paiement.
* Difficulté à suivre les frais.
* Difficulté à savoir si une transaction a été approuvée, rejetée ou déjà payée.
* Manque de traçabilité des employés.
* Perte de temps dans les rapprochements.
* Risque de fraude ou de double déclaration.

D-Transfert doit corriger ces problèmes grâce à un système clair, sécurisé, collaboratif et traçable.

---

## 4. Définitions métier importantes

### 4.1 Entreprise

Une entreprise représente un acteur inscrit sur la plateforme. Elle peut être un multiservice, un agent indépendant, une société de transfert, un point de paiement ou tout autre acteur autorisé à utiliser la plateforme.

Chaque entreprise possède un **matricule unique** dans le système.

### 4.2 Owner

L’Owner est le propriétaire du compte entreprise. Il a tous les droits sur son entreprise.

Il peut :

* Créer son compte.
* Se connecter.
* Configurer ses wallets.
* Ajouter des employés.
* Envoyer des demandes de collaboration.
* Accepter ou rejeter des demandes.
* Modifier ses taux d’envoi privés.
* Effectuer ou valider des opérations.
* Consulter les soldes.
* Consulter les rapports.
* Gérer les fournisseurs.
* Suivre les dettes clients et collaborateurs.

### 4.3 Employé

L’employé est un utilisateur créé par l’Owner. Il travaille pour une entreprise.

Il peut effectuer certaines opérations selon les permissions qui lui sont attribuées.

Exemples de permissions possibles :

* Ajouter une entrée.
* Effectuer un dépôt.
* Effectuer un retrait.
* Initier un envoi.
* Initier un paiement.
* Consulter l’historique.
* Uploader une preuve.
* Gérer les wallets, si autorisé.
* Gérer les fournisseurs, si autorisé.

Par défaut, un employé ne peut pas modifier les informations sensibles de l’entreprise comme les taux privés, les collaborations ou les paramètres globaux, sauf si l’Owner lui donne explicitement ce droit.

### 4.4 Collaborateur

Un collaborateur est une autre entreprise avec laquelle une entreprise a accepté de travailler.

Deux entreprises deviennent collaboratrices après une demande de collaboration acceptée.

Seules deux entreprises collaboratrices peuvent effectuer des opérations internationales entre elles.

### 4.5 Wallet

Un wallet représente une caisse ou un compte de paiement utilisé par l’entreprise.

Exemples :

* Cash.
* Wave.
* Orange Money.
* Free Money.
* Banque.
* Compte mobile money.
* Compte fournisseur.
* Caisse physique.
* Autre moyen de paiement.

Un wallet contient un solde. Chaque opération qui touche un wallet doit modifier son solde automatiquement.

### 4.6 Entrée

Une entrée représente un montant reçu par l’entreprise dans un ou plusieurs wallets, mais qui n’est pas encore totalement affecté à une transaction.

Une entrée peut ensuite être transformée en :

* Envoi international.
* Paiement de dette collaborateur.
* Frais.
* Crédit client.
* Solde non affecté.
* Plusieurs opérations partielles.

### 4.7 Envoi

Un envoi est une opération où une entreprise reçoit de l’argent d’un client et demande à un collaborateur de payer ou remettre l’équivalent à un bénéficiaire.

Exemple :

L’entreprise A reçoit de l’argent d’un client au Sénégal. Elle demande à l’entreprise B en Guinée de payer le bénéficiaire en Guinée.

Après validation du collaborateur B, le solde entre A et B est mis à jour.

### 4.8 Paiement collaborateur

Un paiement collaborateur est une opération qui sert à réduire ou régler une dette entre deux entreprises collaboratrices.

Exemple :

L’entreprise A doit 80 000 GNF à l’entreprise B. Si B reçoit un montant pour le compte de A ou si A effectue un paiement vers B, la plateforme enregistre ce paiement et réduit le solde entre les deux entreprises.

### 4.9 Devise principale de collaboration

La devise principale est la devise de référence utilisée pour calculer et afficher le solde officiel entre deux collaborateurs.

Exemple :

Si la devise principale entre A et B est **GNF**, alors le solde officiel entre A et B est toujours stocké en GNF.

### 4.10 Taux d’envoi privé

Le taux d’envoi est le taux que chaque entreprise configure pour ses propres opérations commerciales.

Ce taux est privé.

Les collaborateurs ne voient pas ce taux.

Il sert principalement à calculer combien un client doit payer ou combien le bénéficiaire doit recevoir selon la politique commerciale de l’entreprise.

Chaque entreprise peut modifier son taux d’envoi à tout moment.

Les anciennes transactions doivent conserver le taux appliqué au moment de leur création.

### 4.11 Taux de paiement collaboratif

Le taux de paiement collaboratif est le taux accepté entre deux entreprises collaboratrices.

Il est visible par les deux parties.

Il sert à convertir les paiements, les soldes et les règlements entre les deux collaborateurs.

Ce taux doit être fixé lors de la création de la collaboration.

Toute modification du taux collaboratif doit être historisée.

La modification ne doit pas changer les anciennes transactions déjà validées.

---

## 5. Règle fondamentale sur les deux taux

La plateforme doit obligatoirement séparer deux types de taux.

### 5.1 Taux d’envoi privé

Utilisation :

* Calcul commercial de l’entreprise.
* Montant demandé au client.
* Montant à envoyer selon le pays ou le collaborateur.
* Marge privée de l’entreprise.

Visibilité :

* Visible uniquement par l’entreprise qui le configure.
* Non visible par les collaborateurs.

Modification :

* Modifiable à tout moment par l’Owner.
* Les anciennes opérations gardent l’ancien taux utilisé.

### 5.2 Taux de paiement collaboratif

Utilisation :

* Calcul des dettes entre deux collaborateurs.
* Conversion des paiements entre collaborateurs.
* Affichage du solde dans les devises concernées.
* Règlement des soldes.

Visibilité :

* Visible par les deux collaborateurs.
* Accepté dans la demande de collaboration.

Modification :

* Doit être historisée.
* Idéalement, toute modification doit être proposée puis acceptée par l’autre collaborateur.
* Les transactions déjà validées ne doivent jamais être recalculées avec le nouveau taux.

---

## 6. Exemple métier corrigé et formalisé

### 6.1 Situation initiale

* Entreprise A et Entreprise B collaborent.
* Devise principale de collaboration : GNF.
* Taux collaboratif : 16.
* Interprétation du taux : **1 FCFA = 16 GNF**.
* L’entreprise A doit 80 000 GNF à l’entreprise B.

Donc :

* Solde côté A : **-80 000 GNF**.
* Solde côté B : **+80 000 GNF**.

### 6.2 Réception d’argent par B

Un client de A dépose de l’argent chez B.

B reçoit **85 000 GNF** dans l’un de ses wallets.

B crée une entrée :

* Montant brut reçu : 85 000 GNF.
* Wallet concerné : par exemple Cash GNF.
* Statut de l’entrée : sans code / non affectée.

### 6.3 Transformation en paiement de dette

B transforme cette entrée en paiement collaborateur.

B déclare que **80 000 GNF** doivent être affectés au règlement de la dette de A.

La plateforme calcule :

* Montant reçu : 85 000 GNF.
* Montant déclaré pour le paiement : 80 000 GNF.
* Frais ou marge de B : 5 000 GNF.
* Montant converti pour A : 80 000 / 16 = 5 000 FCFA.

### 6.4 Résultat

La dette de A envers B est réglée.

Nouveau solde :

* Solde côté A : 0 GNF.
* Solde côté B : 0 GNF.

La plateforme conserve dans l’historique :

* Le montant brut reçu.
* Le montant déclaré.
* Les frais retenus.
* Le taux utilisé.
* Le wallet utilisé.
* La date.
* L’utilisateur ayant enregistré l’opération.
* La preuve, si disponible.
* Le statut de validation.

---

## 7. Acteurs de la plateforme

### 7.1 Super Admin plateforme

Le Super Admin gère toute la plateforme D-Transfert.

Il peut :

* Voir toutes les entreprises inscrites.
* Activer ou désactiver une entreprise.
* Voir les statistiques globales.
* Gérer les paramètres globaux.
* Gérer les incidents.
* Suivre les logs système.
* Gérer les éventuels abonnements.
* Suspendre un compte suspect.
* Consulter les activités pour audit.

Le Super Admin ne doit pas modifier directement les soldes des entreprises sans journalisation complète.

Toute intervention administrative sensible doit être historisée.

### 7.2 Owner entreprise

L’Owner est le responsable principal de son entreprise.

Il peut :

* Créer son compte.
* Modifier les informations de son entreprise.
* Gérer ses employés.
* Gérer ses wallets.
* Configurer ses taux d’envoi privés.
* Envoyer des demandes de collaboration.
* Accepter ou rejeter des demandes.
* Initier des envois.
* Initier des paiements.
* Valider certaines opérations.
* Consulter ses soldes.
* Consulter ses rapports.
* Gérer les fournisseurs.
* Gérer les clients débiteurs ou créditeurs.
* Exporter les données.

### 7.3 Employé

L’employé agit pour le compte d’une entreprise.

Il peut, selon ses permissions :

* Ajouter une entrée.
* Effectuer une opération nationale.
* Initier un envoi.
* Initier un paiement.
* Uploader une preuve.
* Consulter les transactions.
* Consulter les wallets autorisés.
* Gérer les opérations de caisse.

L’employé ne doit pas pouvoir voir les taux d’envoi privés si l’Owner ne l’autorise pas.

L’employé ne doit pas pouvoir modifier les taux collaboratifs.

L’employé ne doit pas pouvoir supprimer définitivement une opération validée.

---

## 8. Inscription entreprise

### 8.1 Formulaire d’inscription

L’inscription doit demander :

* Nom de l’entreprise.
* Matricule souhaité ou matricule généré automatiquement.
* Adresse.
* Numéro de téléphone.
* Mot de passe.
* Confirmation du mot de passe.

### 8.2 Règles

* Le matricule doit être unique dans toute la plateforme.
* Le numéro de téléphone doit être unique ou vérifié selon les règles de la plateforme.
* Le mot de passe doit être sécurisé.
* Après inscription, l’utilisateur devient Owner de l’entreprise.
* L’entreprise peut être active automatiquement ou en attente de validation selon la stratégie choisie.

---

## 9. Connexion

### 9.1 Formulaire de connexion

Champs :

* Matricule.
* Mot de passe.

### 9.2 Règles

* Un Owner se connecte avec le matricule de son entreprise.
* Un employé peut se connecter avec un identifiant lié à l’entreprise.
* La plateforme doit vérifier le statut du compte.
* Si l’entreprise est suspendue, la connexion doit être bloquée.
* Si le mot de passe est incorrect plusieurs fois, un mécanisme de sécurité doit être appliqué.

---

## 10. Réinitialisation du mot de passe

### 10.1 Étapes

1. L’utilisateur saisit son matricule.
2. La plateforme envoie un code OTP au numéro associé.
3. L’utilisateur saisit le code OTP.
4. L’utilisateur définit un nouveau mot de passe.
5. La plateforme confirme la modification.

### 10.2 Règles

* Le code OTP doit expirer après un délai défini.
* Le code OTP ne doit être utilisable qu’une seule fois.
* Les tentatives doivent être limitées.
* L’historique de changement de mot de passe doit être conservé.

---

## 11. Gestion des employés

### 11.1 Ajouter un employé

Formulaire :

* Nom complet.
* Numéro de téléphone.
* Mot de passe.
* Rôle.
* Permissions.

### 11.2 Permissions possibles

* Voir dashboard.
* Gérer entrées.
* Créer envoi.
* Créer paiement.
* Valider opération.
* Gérer wallets.
* Gérer fournisseurs.
* Voir rapports.
* Exporter données.
* Voir taux privés.
* Modifier taux privés.

### 11.3 Règles

* Un employé appartient obligatoirement à une seule entreprise.
* Un employé ne peut pas accéder aux données d’une autre entreprise.
* Les actions d’un employé doivent être historisées.
* L’Owner peut activer, désactiver ou modifier les permissions d’un employé.

---

## 12. Gestion des wallets

### 12.1 Création d’un wallet

Un wallet contient :

* Nom du wallet.
* Code unique interne.
* Type de wallet : cash, mobile money, banque, autre.
* Téléphone associé, si applicable.
* Devise du wallet.
* Solde initial.
* Statut : actif ou inactif.
* Description optionnelle.

### 12.2 Règles

* Un wallet appartient à une seule entreprise.
* Un wallet doit avoir une devise.
* Le solde initial est enregistré une seule fois lors de la création.
* Toute modification de solde après création doit passer par une opération.
* Le système doit garder l’historique complet des mouvements du wallet.
* Un wallet inactif ne peut plus être utilisé dans une nouvelle opération.

---

## 13. Opérations nationales

Les opérations nationales concernent les mouvements internes ou locaux d’une entreprise.

Types principaux :

* Dépôt.
* Retrait.
* Échange entre wallets.
* Rééquilibrage.
* Ajustement justifié.

### 13.1 Principe des lignes de wallet

Une opération nationale peut concerner plusieurs wallets.

Le formulaire doit permettre d’ajouter plusieurs lignes.

Chaque ligne contient :

* Wallet.
* Montant entrée.
* Montant sortie.
* Note optionnelle.

### 13.2 Règle d’équilibre

Pour une opération dans une même devise :

**Total des entrées = Total des sorties**

ou encore :

**Total entrées - Total sorties = 0**

Exemple :

Un client donne 1 000 via Wave et reçoit 1 000 en cash.

Ligne 1 :

* Wallet Cash.
* Entrée : 0.
* Sortie : 1 000.

Ligne 2 :

* Wallet Wave.
* Entrée : 1 000.
* Sortie : 0.

Résultat :

* Le wallet Wave augmente de 1 000.
* Le wallet Cash diminue de 1 000.
* L’opération est équilibrée.

### 13.3 Cas de devises différentes

Si les wallets n’ont pas la même devise, l’opération doit demander :

* Devise source.
* Devise destination.
* Taux appliqué.
* Montant source.
* Montant converti.

Le taux utilisé doit être enregistré dans l’historique.

---

## 14. Gestion des fournisseurs

### 14.1 Objectif

La plateforme doit permettre à une entreprise de suivre ses fournisseurs et les rééquilibrages effectués avec eux.

Un fournisseur peut être une personne ou une entreprise externe qui fournit de la liquidité, du cash, du mobile money ou un service financier.

### 14.2 Création d’un fournisseur

Champs :

* Nom du fournisseur.
* Code fournisseur.
* Téléphone.
* Adresse optionnelle.
* Devise principale.
* Solde initial optionnel.
* Note.

### 14.3 Rééquilibrage fournisseur

Formulaire :

* Code opération.
* Fournisseur.
* Type : dette ou paiement.
* Montant.
* Wallet concerné.
* Note.
* Preuve optionnelle.

### 14.4 Règle de solde fournisseur

Si l’entreprise doit de l’argent au fournisseur, le solde fournisseur doit être négatif côté entreprise.

Si le fournisseur doit de l’argent à l’entreprise, le solde fournisseur doit être positif côté entreprise.

Toute opération fournisseur doit modifier automatiquement :

* Le solde fournisseur.
* Le solde du wallet concerné.
* L’historique des mouvements.

---

## 15. Gestion des collaborations

### 15.1 Demande de collaboration

Une entreprise peut envoyer une demande de collaboration à une autre entreprise en connaissant son matricule.

Formulaire :

* Matricule du collaborateur cible.
* Devise principale de collaboration.
* Taux de paiement collaboratif.
* Note optionnelle.

Boutons :

* Rechercher.
* Envoyer la demande.

### 15.2 Recherche par matricule

Lorsqu’un Owner saisit un matricule :

* La plateforme recherche l’entreprise cible.
* Affiche les informations publiques de l’entreprise.
* N’affiche jamais les informations sensibles.
* N’affiche jamais les taux privés de l’entreprise cible.

Informations publiques possibles :

* Nom de l’entreprise.
* Matricule.
* Téléphone professionnel.
* Pays ou adresse générale.
* Statut actif.

### 15.3 Acceptation ou rejet

L’entreprise cible voit :

* L’entreprise qui demande la collaboration.
* La devise principale proposée.
* Le taux collaboratif proposé.
* La note.
* La date de demande.

Actions possibles :

* Accepter.
* Rejeter.
* Proposer une modification du taux, si cette option est retenue.

### 15.4 Statuts de collaboration

Une collaboration peut avoir les statuts suivants :

* En attente.
* Acceptée.
* Rejetée.
* Suspendue.
* Archivée.

Seules les collaborations acceptées permettent de créer des envois ou paiements internationaux.

---

## 16. Historique des collaborations

Pour chaque collaboration, la plateforme doit afficher :

* Solde actuel.
* Devise principale.
* Taux collaboratif actuel.
* Historique des taux.
* Historique des envois.
* Historique des paiements.
* Historique des rejets.
* Historique des preuves.
* Utilisateurs ayant effectué les actions.
* Dates et heures.

---

## 17. Gestion du solde entre collaborateurs

### 17.1 Principe

Chaque collaboration possède un solde partagé en devise principale.

Le solde est vu de manière opposée par les deux collaborateurs.

Si l’entreprise A voit un solde positif, cela signifie que B lui doit de l’argent.

Si l’entreprise A voit un solde négatif, cela signifie que A doit de l’argent à B.

Côté B, le même solde est affiché dans le sens inverse.

### 17.2 Exemple

Si A doit 80 000 GNF à B :

* A voit : -80 000 GNF.
* B voit : +80 000 GNF.

Si un paiement de 80 000 GNF est validé :

* A voit : 0 GNF.
* B voit : 0 GNF.

### 17.3 Règle d’intégrité

Le solde entre deux collaborateurs ne doit jamais être modifié manuellement sans opération justificative.

Tout changement de solde doit venir d’une opération validée :

* Envoi approuvé.
* Paiement approuvé.
* Ajustement validé.
* Annulation contrôlée.

---

## 18. Gestion des taux

### 18.1 Taux d’envoi privé

Chaque entreprise doit pouvoir configurer un taux d’envoi privé par :

* Collaborateur.
* Pays.
* Devise.
* Type d’opération, si nécessaire.

Ce taux est utilisé lors de la création des envois.

Il n’est visible que par l’entreprise propriétaire du taux.

### 18.2 Taux collaboratif

Le taux collaboratif est défini entre deux entreprises.

Il est utilisé pour :

* Les paiements de dette.
* L’affichage converti des soldes.
* Les règlements entre collaborateurs.
* Les calculs de conversion entre la devise principale et la devise locale.

### 18.3 Historique des taux

Chaque changement de taux doit enregistrer :

* Ancien taux.
* Nouveau taux.
* Date du changement.
* Utilisateur ayant modifié.
* Statut : proposé, accepté, refusé.
* Note optionnelle.

### 18.4 Règle de non-rétroactivité

Une transaction validée conserve toujours le taux utilisé au moment de sa création.

Même si le taux change plus tard, les anciennes transactions ne doivent pas être recalculées.

---

## 19. Enregistrement des entrées

### 19.1 Objectif

Une entrée permet d’enregistrer un montant reçu dans un ou plusieurs wallets avant de savoir exactement comment il sera utilisé.

Elle peut représenter :

* Un dépôt client.
* Un montant reçu pour un collaborateur.
* Une somme à affecter à un envoi.
* Une somme à affecter à un paiement de dette.
* Une somme à répartir en plusieurs opérations.

### 19.2 Formulaire de création d’entrée

Le formulaire doit contenir :

* Date.
* Référence automatique.
* Client optionnel.
* Note.
* Lignes de wallets.

Chaque ligne de wallet contient :

* Wallet.
* Montant reçu.
* Devise.
* Note optionnelle.

### 19.3 Statut d’une entrée

Une entrée peut avoir les statuts suivants :

* Sans code.
* Partiellement affectée.
* Affectée à un envoi.
* Affectée à un paiement.
* Totalement consommée.
* Rejetée.
* Annulée.

### 19.4 Fusion d’entrées

La plateforme doit permettre de fusionner plusieurs entrées si elles concernent une seule transaction.

Règles :

* Seules les entrées sans code ou partiellement affectées peuvent être fusionnées.
* Les entrées doivent appartenir à la même entreprise.
* La fusion doit conserver les anciennes références dans l’historique.
* La fusion doit créer une nouvelle référence principale.
* La fusion doit être historisée.

---

## 20. Transformation d’une entrée en envoi

### 20.1 Principe

Une entrée sans code ou partiellement affectée peut être transformée en envoi international.

L’entreprise sélectionne le collaborateur concerné et déclare le montant à envoyer.

### 20.2 Formulaire d’envoi depuis une entrée

Champs :

* Collaborateur.
* Montant d’envoi.
* Devise du montant.
* Numéro de téléphone du bénéficiaire.
* Nom du bénéficiaire, optionnel.
* Mode d’envoi : cash, Wave, Orange Money, banque, autre.
* Note.
* Preuve optionnelle.
* Client concerné, si une dette est détectée.
* Taux d’envoi privé utilisé.
* Taux collaboratif de référence, si nécessaire.

### 20.3 Règle de calcul

La plateforme doit calculer :

* Montant reçu dans l’entrée.
* Montant déclaré pour l’envoi.
* Reste disponible.
* Éventuels frais.
* Éventuelle dette client.
* Équivalent selon le taux privé d’envoi.
* Impact sur le solde collaborateur après validation.

### 20.4 Si le montant d’envoi est inférieur à l’entrée

Si le montant déclaré est inférieur au montant disponible de l’entrée, le reste peut être :

* Conservé comme frais.
* Affecté à une autre opération.
* Crédité au solde du client.
* Gardé comme montant non affecté.

La plateforme doit demander à l’utilisateur quoi faire du reliquat.

### 20.5 Si le montant d’envoi est égal à l’entrée

L’entrée est totalement consommée.

Aucun reliquat n’est créé.

### 20.6 Si le montant d’envoi est supérieur à l’entrée

La plateforme détecte automatiquement un manque.

Ce manque doit être traité comme :

* Dette client.
* Avance entreprise.
* Complément à recevoir.

Dans ce cas, un champ doit s’afficher pour sélectionner ou créer le client concerné.

Le montant manquant doit être enregistré dans le solde client.

### 20.7 Validation par le collaborateur

Une fois l’envoi créé :

* Le collaborateur cible reçoit une notification.
* Il voit une demande de paiement en attente.
* Il peut approuver ou rejeter.
* S’il approuve, il doit pouvoir ajouter une preuve.
* S’il rejette, l’entrée revient à son état précédent ou devient à corriger.

### 20.8 Impact sur les soldes

Lorsque le collaborateur approuve l’envoi :

* Le solde entre collaborateurs est mis à jour.
* L’entreprise initiatrice doit le montant au collaborateur, sauf règle contraire définie.
* Le collaborateur voit le solde inverse.
* La transaction devient validée.

---

## 21. Transformation d’une entrée en paiement de dette

### 21.1 Principe

Une entrée peut aussi être transformée en paiement de dette collaborateur.

Cela signifie que le montant reçu sert à réduire une dette existante entre deux entreprises.

### 21.2 Formulaire

Champs :

* Collaborateur concerné.
* Montant brut reçu.
* Montant à déclarer pour le paiement.
* Devise.
* Taux collaboratif utilisé.
* Note.
* Client ou numéro, optionnel.
* Preuve optionnelle.
* Traitement du reliquat : frais, solde client ou autre affectation.

### 21.3 Règle de calcul

La plateforme doit calculer :

* Montant brut reçu.
* Montant déclaré au collaborateur.
* Frais retenus.
* Montant converti selon le taux collaboratif.
* Impact sur le solde collaborateur.
* Nouveau solde prévisionnel.

### 21.4 Exemple

B reçoit 85 000 GNF.

B déclare 80 000 GNF comme paiement pour A.

La plateforme calcule :

* Montant reçu : 85 000 GNF.
* Montant déclaré : 80 000 GNF.
* Frais B : 5 000 GNF.
* Taux collaboratif : 16.
* Équivalent FCFA : 5 000 FCFA.
* Solde A/B réduit de 80 000 GNF.

Si A devait exactement 80 000 GNF à B, le solde devient zéro.

---

## 22. Paiement collaborateur direct

### 22.1 Principe

Un paiement collaborateur peut aussi être créé directement sans passer par une entrée.

Cela permet de régler une dette entre collaborateurs.

### 22.2 Formulaire

Le collaborateur clique sur le bouton **Paiement**.

Champs :

* Collaborateur concerné.
* Montant à payer.
* Devise du paiement.
* Wallet utilisé, si paiement réel depuis un wallet.
* Taux collaboratif appliqué.
* Note optionnelle.
* Nom ou numéro du client, optionnel.
* Preuve optionnelle.

### 22.3 Validation

Le paiement peut être :

* En attente.
* Approuvé.
* Rejeté.
* Annulé.

Le collaborateur concerné doit valider le paiement pour que le solde soit définitivement modifié.

### 22.4 Impact

Une fois approuvé :

* Le solde collaborateur est diminué ou augmenté selon le sens de la dette.
* Le wallet utilisé est mis à jour si le paiement sort réellement d’un wallet.
* L’historique de paiement est mis à jour.
* Les deux parties voient la même opération dans des sens opposés.

---

## 23. Rejet d’une opération

### 23.1 Rejet d’un envoi

Si un collaborateur rejette un envoi :

* Le statut de l’envoi devient rejeté.
* L’entrée liée redevient disponible ou partiellement disponible.
* Le solde collaborateur n’est pas modifié définitivement.
* La raison du rejet doit être obligatoire.
* L’historique doit conserver le rejet.

### 23.2 Rejet d’un paiement

Si un collaborateur rejette un paiement :

* Le paiement devient rejeté.
* Le solde collaborateur ne change pas.
* L’entrée liée, si elle existe, redevient disponible.
* Une raison de rejet doit être indiquée.

---

## 24. Gestion des clients et dettes clients

### 24.1 Objectif

La plateforme doit permettre de suivre les clients liés aux opérations, surtout lorsque :

* Le client doit de l’argent à l’entreprise.
* L’entreprise doit de l’argent au client.
* Une entrée est supérieure au montant déclaré.
* Une entrée est inférieure au montant déclaré.
* Un reliquat doit être conservé.

### 24.2 Solde client

Si le client doit de l’argent à l’entreprise, son solde est positif.

Si l’entreprise doit de l’argent au client, son solde est négatif.

### 24.3 Création rapide de client

Lorsqu’une dette est détectée, la plateforme doit permettre de sélectionner un client existant ou d’en créer un rapidement avec :

* Nom.
* Numéro de téléphone.
* Note.

---

## 25. Preuves et pièces jointes

La plateforme doit permettre d’ajouter des preuves aux opérations.

Types acceptés :

* Image.
* PDF.
* Capture d’écran.
* Photo de reçu.

Chaque preuve doit être liée à une opération précise.

La plateforme doit conserver :

* Le fichier.
* La date d’upload.
* L’utilisateur ayant uploadé.
* Le type d’opération.
* Le statut de validation.

---

## 26. Notifications

La plateforme doit notifier les utilisateurs lors des événements importants.

Exemples :

* Nouvelle demande de collaboration.
* Collaboration acceptée.
* Collaboration rejetée.
* Nouvel envoi à valider.
* Paiement à valider.
* Opération rejetée.
* Preuve ajoutée.
* Taux collaboratif modifié.
* Solde critique atteint.
* Wallet insuffisant.

Canaux possibles :

* Notification interne.
* Email.
* SMS.
* WhatsApp, si intégré plus tard.

---

## 27. Dashboard

### 27.1 Dashboard Owner

Le dashboard doit afficher :

* Solde total par wallet.
* Solde par collaborateur.
* Total des entrées du jour.
* Total des envois du jour.
* Total des paiements du jour.
* Transactions en attente.
* Transactions rejetées.
* Collaborations actives.
* Dettes clients.
* Dettes fournisseurs.
* Alertes importantes.

### 27.2 Dashboard Employé

Selon ses permissions, l’employé peut voir :

* Ses opérations du jour.
* Les entrées créées.
* Les envois initiés.
* Les paiements initiés.
* Les transactions en attente.
* Les wallets autorisés.

### 27.3 Dashboard Super Admin

Le Super Admin voit :

* Nombre d’entreprises inscrites.
* Nombre d’entreprises actives.
* Nombre de transactions.
* Volume global déclaré.
* Activité par pays.
* Entreprises suspendues.
* Incidents.
* Logs sensibles.

---

## 28. Historiques

La plateforme doit conserver plusieurs historiques.

### 28.1 Historique des entrées

* Référence.
* Date.
* Wallets concernés.
* Montants.
* Statut.
* Utilisateur.
* Affectations.

### 28.2 Historique des envois

* Collaborateur.
* Montant.
* Taux utilisé.
* Statut.
* Bénéficiaire.
* Mode d’envoi.
* Preuve.
* Date de validation.

### 28.3 Historique des paiements

* Collaborateur.
* Montant.
* Taux collaboratif.
* Wallet utilisé.
* Client optionnel.
* Statut.
* Preuve.
* Date.

### 28.4 Historique des taux

* Ancien taux.
* Nouveau taux.
* Type de taux.
* Collaborateur concerné.
* Date.
* Utilisateur.

### 28.5 Historique des wallets

* Entrées.
* Sorties.
* Solde avant.
* Solde après.
* Opération liée.
* Utilisateur.

---

## 29. Rapports et exports

La plateforme doit permettre d’exporter :

* Transactions par période.
* Solde par collaborateur.
* Historique d’un wallet.
* Rapport journalier.
* Rapport mensuel.
* Rapport par employé.
* Rapport fournisseur.
* Rapport client.
* Rapport des frais.
* Rapport des opérations rejetées.

Formats souhaités :

* PDF.
* Excel.
* CSV.

---

## 30. Règles de sécurité

### 30.1 Authentification

* Connexion par matricule et mot de passe.
* Mot de passe hashé.
* OTP pour reset password.
* Sessions sécurisées.
* Déconnexion automatique après inactivité.

### 30.2 Autorisations

* Chaque utilisateur accède uniquement aux données de son entreprise.
* Les employés ont des permissions limitées.
* Les taux privés ne sont visibles que par les personnes autorisées.
* Les opérations sensibles doivent demander une confirmation.

### 30.3 Journalisation

Toutes les actions importantes doivent être enregistrées :

* Connexion.
* Création d’entrée.
* Création d’envoi.
* Validation.
* Rejet.
* Modification de taux.
* Modification de wallet.
* Création d’employé.
* Changement de permission.
* Intervention admin.

### 30.4 Données sensibles

La plateforme doit protéger :

* Mots de passe.
* Numéros de téléphone.
* Preuves de paiement.
* Soldes.
* Taux privés.
* Informations d’entreprise.

---

## 31. Règles d’intégrité financière

### 31.1 Pas de suppression définitive

Une opération validée ne doit jamais être supprimée définitivement.

En cas d’erreur, il faut créer :

* Une annulation.
* Une correction.
* Une opération inverse.
* Un ajustement justifié.

### 31.2 Solde wallet

Chaque mouvement de wallet doit avoir :

* Un montant.
* Un sens : entrée ou sortie.
* Une référence.
* Un utilisateur.
* Un solde avant.
* Un solde après.

### 31.3 Solde collaborateur

Chaque mouvement de solde collaborateur doit avoir :

* Une opération source.
* Une devise principale.
* Un taux utilisé.
* Un sens.
* Un statut.
* Une validation.

### 31.4 Taux figé par transaction

Chaque transaction doit conserver le taux utilisé au moment de sa création.

---

## 32. Modules fonctionnels

La version complète de D-Transfert doit contenir les modules suivants :

1. Authentification.
2. Gestion entreprise.
3. Gestion employés.
4. Gestion rôles et permissions.
5. Gestion wallets.
6. Opérations nationales.
7. Entrées.
8. Envois internationaux.
9. Paiements collaborateurs.
10. Collaborations.
11. Taux privés.
12. Taux collaboratifs.
13. Clients et dettes clients.
14. Fournisseurs.
15. Preuves.
16. Notifications.
17. Dashboard.
18. Rapports.
19. Audit logs.
20. Administration plateforme.

---

## 33. Parcours utilisateur principal

### 33.1 Création de compte

1. L’Owner crée son compte entreprise.
2. Il reçoit ou choisit un matricule unique.
3. Il se connecte.
4. Il configure ses wallets.
5. Il ajoute ses employés.
6. Il configure ses taux d’envoi privés.
7. Il envoie des demandes de collaboration.

### 33.2 Collaboration

1. L’entreprise A recherche l’entreprise B par matricule.
2. A propose une devise principale et un taux collaboratif.
3. B reçoit la demande.
4. B accepte ou rejette.
5. Si B accepte, la collaboration devient active.
6. Les deux entreprises peuvent faire des envois et paiements.

### 33.3 Envoi international

1. A reçoit de l’argent d’un client.
2. A crée une entrée.
3. A transforme l’entrée en envoi vers B.
4. B reçoit une demande à valider.
5. B effectue le paiement au bénéficiaire.
6. B ajoute une preuve.
7. B approuve.
8. Le solde A/B est mis à jour.

### 33.4 Paiement de dette

1. Une entreprise constate une dette collaborateur.
2. Elle crée un paiement direct ou transforme une entrée en paiement.
3. Le collaborateur concerné reçoit la demande.
4. Il approuve ou rejette.
5. Si approuvé, le solde est mis à jour.

---

## 34. Écrans principaux à prévoir

### 34.1 Authentification

* Inscription.
* Connexion.
* Mot de passe oublié.
* Vérification OTP.
* Nouveau mot de passe.

### 34.2 Tableau de bord

* Vue globale.
* Soldes wallets.
* Soldes collaborateurs.
* Alertes.
* Transactions récentes.

### 34.3 Wallets

* Liste des wallets.
* Création wallet.
* Détail wallet.
* Historique wallet.
* Activation/désactivation.

### 34.4 Employés

* Liste employés.
* Ajouter employé.
* Modifier permissions.
* Désactiver employé.
* Historique actions employé.

### 34.5 Collaborations

* Liste collaborateurs.
* Nouvelle demande.
* Demandes reçues.
* Détail collaboration.
* Historique taux.
* Historique transactions.
* Solde collaborateur.

### 34.6 Entrées

* Liste entrées.
* Nouvelle entrée.
* Détail entrée.
* Fusionner entrées.
* Transformer en envoi.
* Transformer en paiement.
* Affecter reliquat.

### 34.7 Envois

* Nouvel envoi.
* Envois en attente.
* Envois approuvés.
* Envois rejetés.
* Détail envoi.
* Upload preuve.

### 34.8 Paiements

* Nouveau paiement.
* Paiements en attente.
* Paiements approuvés.
* Paiements rejetés.
* Détail paiement.
* Upload preuve.

### 34.9 Fournisseurs

* Liste fournisseurs.
* Nouveau fournisseur.
* Rééquilibrage.
* Détail fournisseur.
* Solde fournisseur.

### 34.10 Clients

* Liste clients.
* Détail client.
* Solde client.
* Historique client.

### 34.11 Rapports

* Rapport journalier.
* Rapport mensuel.
* Rapport collaborateur.
* Rapport wallet.
* Rapport employé.
* Rapport fournisseur.
* Export PDF/Excel.

---

## 35. Statuts recommandés

### 35.1 Statuts d’entrée

* Sans code.
* Partiellement affectée.
* Affectée.
* Consommée.
* Annulée.

### 35.2 Statuts d’envoi

* En attente.
* Approuvé.
* Rejeté.
* Annulé.

### 35.3 Statuts de paiement

* En attente.
* Approuvé.
* Rejeté.
* Annulé.

### 35.4 Statuts de collaboration

* En attente.
* Acceptée.
* Rejetée.
* Suspendue.
* Archivée.

---

## 36. Architecture technique recommandée

### 36.1 Application web/mobile

La plateforme doit être accessible sur :

* Ordinateur.
* Tablette.
* Téléphone.
* Navigateur web.
* PWA mobile.

Une application mobile native peut être prévue plus tard, mais une PWA responsive est recommandée pour le MVP.

### 36.2 Backend recommandé

Technologies possibles :

* FastAPI, NestJS.
* API REST.
* Base de données PostgreSQL.
* Redis pour cache et files d’attente.
* Stockage fichiers local au début, puis S3 compatible plus tard.

### 36.3 Frontend recommandé

* Next.js.
* Interface responsive.
* Composants modernes.
* Tableaux filtrables.
* Formulaires simples.
* Expérience mobile prioritaire.

### 36.4 Base de données

Tables principales recommandées :

* users.
* companies.
* employees.
* roles.
* permissions.
* wallets.
* wallet_movements.
* collaborations.
* collaboration_rate_history.
* private_sending_rates.
* entries.
* entry_lines.
* transfers.
* payments.
* suppliers.
* supplier_movements.
* clients.
* client_balances.
* proofs.
* notifications.
* audit_logs.

---

## 37. MVP recommandé

Pour lancer rapidement la première version, le MVP doit contenir uniquement les fonctionnalités essentielles.

### 37.1 MVP obligatoire

* Inscription entreprise.
* Connexion.
* Gestion wallets.
* Gestion employés simple.
* Demande de collaboration par matricule.
* Acceptation/rejet collaboration.
* Taux collaboratif.
* Taux d’envoi privé.
* Enregistrement d’entrée.
* Transformation entrée en envoi.
* Transformation entrée en paiement.
* Paiement direct collaborateur.
* Solde par collaborateur.
* Historique envois.
* Historique paiements.
* Preuves.
* Dashboard simple.
* Rapport journalier.
* Audit de base.

### 37.2 Hors MVP mais à prévoir

* Abonnements.
* Paiement en ligne intégré.
* WhatsApp automatique.
* SMS automatique.
* Application mobile native.
* Comptabilité avancée.
* IA de détection d’anomalies.
* Scoring de confiance collaborateur.
* Marketplace publique de collaborateurs.
* KYC avancé.
* Multi-agences par entreprise.
* API publique.

---

## 38. Critères d’acceptation

La plateforme sera considérée comme fonctionnelle si :

* Une entreprise peut créer un compte avec matricule unique.
* Un Owner peut créer des wallets.
* Un Owner peut créer des employés.
* Deux entreprises peuvent collaborer après acceptation.
* Le taux collaboratif est visible par les deux parties.
* Le taux d’envoi privé reste invisible pour les collaborateurs.
* Une entrée peut être créée avec plusieurs wallets.
* Une entrée peut être transformée en envoi.
* Une entrée peut être transformée en paiement.
* Un envoi doit être approuvé ou rejeté par le collaborateur.
* Un paiement doit être approuvé ou rejeté par le collaborateur.
* Le solde entre collaborateurs est automatiquement mis à jour.
* Les wallets sont automatiquement mis à jour.
* Les preuves peuvent être uploadées.
* L’historique complet est consultable.
* Les anciennes transactions gardent leur taux initial.
* Les opérations validées ne peuvent pas être supprimées sans correction historisée.

---

## 39. Règles importantes à ne pas oublier

1. Le taux d’envoi privé ne doit jamais être visible par les collaborateurs.
2. Le taux collaboratif doit être visible et accepté par les deux parties.
3. Le solde entre collaborateurs doit être identique mais inversé selon le point de vue.
4. Une entrée peut être utilisée partiellement.
5. Un reliquat d’entrée doit être traité clairement : frais, crédit client ou nouvelle affectation.
6. Une dette client doit être créée automatiquement si le montant déclaré dépasse l’entrée disponible.
7. Une opération rejetée ne doit pas modifier définitivement le solde.
8. Une opération approuvée doit figer le taux utilisé.
9. Les preuves doivent être liées à des opérations précises.
10. Tout mouvement financier doit être traçable.

---

## 40. Points à valider avant développement

Les règles ci-dessous sont proposées pour éliminer les ambiguïtés. Elles doivent être validées avant le développement.

### 40.1 Sens exact du taux collaboratif

Proposition retenue dans ce cahier des charges :

**1 unité de la devise secondaire = X unités de la devise principale.**

Exemple :

Si la devise principale est GNF et le taux est 16 :

**1 FCFA = 16 GNF**

Donc :

**80 000 GNF = 5 000 FCFA**

### 40.2 Validation des modifications de taux collaboratif

Recommandation :

Toute modification du taux collaboratif doit être proposée par une entreprise et acceptée par l’autre avant application.

### 40.3 Gestion du reliquat

Recommandation :

Lorsqu’une entrée est supérieure au montant déclaré, le système doit demander à l’utilisateur de choisir :

* Frais.
* Crédit client.
* Autre opération.
* Solde non affecté.

### 40.4 Gestion des employés

Recommandation :

Mettre en place des permissions détaillées dès le MVP pour éviter que les employés aient trop de droits.

### 40.5 Nature réglementaire

D-Transfert doit être présenté au démarrage comme une plateforme de gestion, suivi, validation et rapprochement des transactions entre collaborateurs.

Si la plateforme commence à encaisser ou transférer réellement l’argent à la place des entreprises, il faudra prévoir une validation juridique et réglementaire adaptée aux pays concernés.

---

## 41. Conclusion

D-Transfert doit devenir une plateforme collaborative de référence pour les acteurs africains du transfert d’argent, des paiements, des dépôts, retraits et règlements entre partenaires.

La valeur principale de la plateforme repose sur :

* La traçabilité.
* La confiance entre collaborateurs.
* La clarté des soldes.
* La séparation des taux privés et collaboratifs.
* La validation croisée des opérations.
* La gestion intelligente des entrées.
* La réduction des conflits.
* Le suivi précis des wallets.
* L’historique complet des transactions.

La première version doit rester simple, rapide et fiable, tout en posant une architecture solide pour évoluer vers une marketplace financière collaborative plus avancée en Afrique.

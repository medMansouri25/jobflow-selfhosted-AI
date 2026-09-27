# Trois statuts de Candidature

Une Candidature n'a que trois statuts : **Postulée → Entretien → Refusée** (Postulée → Refusée aussi ; Refusée est définitive ; aucun retour en arrière). Le modèle initial en comptait six (Brouillon, Postulée, Entretien, Acceptée, Refusée, Classée) ; après avoir vu le tableau de bord, l'utilisateur a jugé Brouillon, Acceptée et Classée inutiles pour son usage réel : il ne saisit une Candidature qu'une fois envoyée, une embauche peut rester en Entretien, et une Candidature sans réponse peut rester Postulée. La simplicité de saisie et de lecture a été préférée à la précision du suivi.

## Consequences

- Toute Candidature naît Postulée : localisation, contrat, source et date de candidature sont toujours obligatoires, et le formulaire n'a qu'un bouton « Enregistrer ».
- On ne distingue plus une candidature « active » d'une candidature « terminée », ni une candidature sans réponse d'une candidature en cours : les filtres de liste se font par statut. Une embauche n'est pas visible dans les statuts (seulement dans les notes).
- La migration `20260927160000_three_application_statuses` convertit les anciennes valeurs (Brouillon et Classée → Postulée, Acceptée → Entretien), dans les Candidatures et dans l'historique, puis retire ces valeurs de l'enum. Revenir à six statuts demanderait une nouvelle migration, sans pouvoir retrouver les statuts d'origine des lignes converties.

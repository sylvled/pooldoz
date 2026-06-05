export function PrivacyScreen() {
  return (
    <div
      style={{
        padding: 'var(--page-h)',
        paddingTop: 'var(--safe-top)',
        maxWidth: 680,
        margin: '0 auto',
      }}
    >
      <h1 style={{ fontFamily: 'var(--font-display)', marginBottom: 24 }}>
        Politique de confidentialité
      </h1>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Données collectées</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          PoolDoz collecte uniquement les données nécessaires au fonctionnement
          de l'application : profils de piscines (géométrie, zones de profondeur,
          volume calculé) et sessions de dosage (produit, taux mesuré, dose).
          Ces données sont stockées localement sur votre appareil (IndexedDB) et,
          si vous créez un compte, synchronisées avec notre serveur hébergé en
          Union Européenne.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Hébergement</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Toutes les données personnelles sont hébergées sur un serveur privé
          situé en Union Européenne, conformément au RGPD. Aucune donnée n'est
          transmise à des tiers.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Durée de conservation</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Les données sont conservées tant que votre compte est actif. Vous
          pouvez supprimer votre compte et l'intégralité de vos données à tout
          moment depuis l'écran Réglages.
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Vos droits</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Conformément au RGPD, vous disposez d'un droit d'accès, de
          rectification et d'effacement de vos données. La suppression du compte
          entraîne la suppression immédiate et irréversible de toutes vos données
          (profils piscines, sessions de dosage, paramètres).
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: 18, marginBottom: 8 }}>Contact</h2>
        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          Pour toute question relative à vos données personnelles, contactez-nous
          via les Réglages de l'application.
        </p>
      </section>
    </div>
  )
}

import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>Hungr</p>
          <h1>Share the foods you love, without the scroll fatigue.</h1>
          <p className={styles.lead}>
            Capture your favorite bites, tag the spot, and keep a clean feed for
            friends and family. Hungr is your personal food diary with a
            delightful social layer.
          </p>
          <div className={styles.ctas}>
            <button className={styles.primary}>Get Started</button>
            <button className={styles.secondary}>View API Docs</button>
          </div>
        </header>

        <section className={styles.features}>
          <div className={styles.featureCard}>
            <h3>Fast snapshots</h3>
            <p>Post a dish in seconds with smart defaults and clean metadata.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Private by default</h3>
            <p>Keep entries private or share them with selected circles.</p>
          </div>
          <div className={styles.featureCard}>
            <h3>API ready</h3>
            <p>Use our Swagger and Orval clients to build custom experiences.</p>
          </div>
        </section>

        <section className={styles.status}>
          <div>
            <h4>API status</h4>
            <p>Health check and Mongo connection in one glance.</p>
          </div>
          <button className={styles.ghost}>Check /healthz</button>
        </section>
      </main>
    </div>
  );
}


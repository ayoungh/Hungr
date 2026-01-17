import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <div className={styles.brand}>Hungr</div>
          <div className={styles.navLinks}>
            <Link href="/foods">Foods</Link>
            <Link href="/login">Log in</Link>
            <Link className={styles.navCta} href="/signup">
              Sign up
            </Link>
          </div>
        </nav>

        <header className={styles.hero}>
          <p className={styles.eyebrow}>Hungr</p>
          <h1>Share the foods you love, without the scroll fatigue.</h1>
          <p className={styles.lead}>
            Capture your favorite bites, tag the spot, and keep a clean feed for
            friends and family. Hungr is your personal food diary with a
            delightful social layer.
          </p>
          <div className={styles.ctas}>
            <Link className={styles.primary} href="/signup">
              Get Started
            </Link>
            <a className={styles.secondary} href="http://localhost:3000/api/docs" target="_blank" rel="noreferrer">
              View API Docs
            </a>
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
          <a className={styles.ghost} href="http://localhost:3000/healthz" target="_blank" rel="noreferrer">
            Check /healthz
          </a>
        </section>
      </main>
    </div>
  );
}


"use client";

import Link from "next/link";
import { useState } from "react";
import { getHungrAPI } from "@/api";
import type { PostApiLoginBody } from "@/api/model";
import "@/lib/api";
import styles from "../auth.module.css";

export default function LoginPage() {
  const api = getHungrAPI();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const payload: PostApiLoginBody = { email, password };

    try {
      const response = await api.postApiLogin(payload);
      const token = (response as any).data?.token;
      if (token) {
        localStorage.setItem("hungr_token", token);
        setSuccess("Logged in. Head to your foods list.");
      } else {
        setError("No token returned. Check your credentials.");
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>Welcome back</h1>
          <p className={styles.subtitle}>Log in to access your Hungr feed.</p>
        </div>
        <form className={styles.form} onSubmit={onSubmit}>
          <label className={styles.field}>
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className={styles.field}>
            Password
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Log in"}
            </button>
            <Link className={styles.link} href="/signup">
              Need an account? Create one.
            </Link>
          </div>
        </form>
        {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
        {success && (
          <div className={`${styles.message} ${styles.success}`}>{success}</div>
        )}
      </div>
    </div>
  );
}

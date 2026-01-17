"use client";

import Link from "next/link";
import { useState } from "react";
import { getHungrAPI } from "@/api";
import type { PostApiUsersBody } from "@/api/model";
import "@/lib/api";
import styles from "../auth.module.css";

export default function SignupPage() {
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

    const payload: PostApiUsersBody = { email, password };

    try {
      await api.postApiUsers(payload);
      setSuccess("Account created. You can log in now.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Signup failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div>
          <h1 className={styles.title}>Create your Hungr account</h1>
          <p className={styles.subtitle}>Join the feed and start posting foods.</p>
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
              minLength={8}
            />
          </label>
          <div className={styles.actions}>
            <button className={styles.primary} type="submit" disabled={loading}>
              {loading ? "Creating account..." : "Sign up"}
            </button>
            <Link className={styles.link} href="/login">
              Already have an account? Log in.
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

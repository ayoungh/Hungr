"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHungrAPI } from "@/api";
import "@/lib/api";
import { authHeader } from "@/lib/api";
import type { PostApiFoodsBody } from "@/api/model";
import styles from "./foods.module.css";

interface FoodItem {
  _id?: string;
  name?: string;
  image?: string;
  createdAt?: string;
}

export default function FoodsPage() {
  const api = getHungrAPI();
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const token = typeof window !== "undefined" ? localStorage.getItem("hungr_token") : null;

  const loadFoods = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");

    try {
      const response = await api.getApiFoods({ headers: authHeader(token) });
      setFoods((response as any).data?.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load foods.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFoods();
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!token) {
      setError("Log in first to add foods.");
      return;
    }

    const payload: PostApiFoodsBody = { name, image };

    try {
      await api.postApiFoods(payload, { headers: authHeader(token) });
      setName("");
      setImage("");
      setSuccess("Food added.");
      await loadFoods();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to add food.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("hungr_token");
    setFoods([]);
    setSuccess("Logged out.");
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Your foods</h1>
          <p className={styles.subtle}>Track the meals you want to share.</p>
        </div>
        <div className={styles.actions}>
          <Link className={styles.button} href="/">
            Home
          </Link>
          {token ? (
            <button className={styles.button} onClick={handleLogout}>
              Log out
            </button>
          ) : (
            <Link className={styles.button} href="/login">
              Log in
            </Link>
          )}
          <Link className={`${styles.button} ${styles.primary}`} href="/signup">
            Sign up
          </Link>
        </div>
      </header>

      {loading && <p className={styles.subtle}>Loading foods...</p>}
      {!token && !loading && (
        <p className={styles.subtle}>Log in to view and add foods.</p>
      )}

      <form className={styles.form} onSubmit={handleCreate}>
        <input
          type="text"
          placeholder="Food name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
        />
        <input
          type="url"
          placeholder="Image URL (optional)"
          value={image}
          onChange={(event) => setImage(event.target.value)}
        />
        <button className={`${styles.button} ${styles.primary}`} type="submit">
          Add food
        </button>
      </form>

      <section className={styles.grid}>
        {foods.map((food) => (
          <div key={food._id || food.name} className={styles.card}>
            <span>Dish</span>
            <h3>{food.name}</h3>
            <p className={styles.subtle}>{food.image || "No image"}</p>
          </div>
        ))}
      </section>

      {error && <div className={`${styles.message} ${styles.error}`}>{error}</div>}
      {success && (
        <div className={`${styles.message} ${styles.success}`}>{success}</div>
      )}
    </div>
  );
}

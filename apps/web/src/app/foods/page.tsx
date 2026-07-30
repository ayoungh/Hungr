"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getHungrAPI } from "@/api";
import type { CreateFoodDto, FoodResponseDto } from "@/api/model";
import "@/lib/api";
import { apiErrorMessage } from "@/lib/api";
import styles from "./foods.module.css";

const api = getHungrAPI();

type AuthenticationState = "checking" | "authenticated" | "anonymous";

export default function FoodsPage() {
  const [foods, setFoods] = useState<FoodResponseDto[]>([]);
  const [authentication, setAuthentication] =
    useState<AuthenticationState>("checking");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  const loadFoods = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.listFoods();
      setFoods(response.data.data.foods);
    } catch (requestError: unknown) {
      setError(apiErrorMessage(requestError, "Failed to load foods."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      try {
        await api.getSession();
        if (!active) return;
        setAuthentication("authenticated");
        await loadFoods();
      } catch {
        if (!active) return;
        setAuthentication("anonymous");
        setFoods([]);
        setLoading(false);
      }
    };

    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (authentication !== "authenticated") {
      setError("Log in first to add foods.");
      return;
    }

    const payload: CreateFoodDto = {
      name,
      ...(image ? { imageUrl: image } : {}),
    };

    try {
      await api.createFood(payload);
      setName("");
      setImage("");
      setSuccess("Food added.");
      await loadFoods();
    } catch (requestError: unknown) {
      setError(apiErrorMessage(requestError, "Failed to add food."));
    }
  };

  const handleLogout = async () => {
    setError("");
    try {
      await api.logout();
      setAuthentication("anonymous");
      setFoods([]);
      setSuccess("Logged out.");
    } catch (requestError: unknown) {
      setError(apiErrorMessage(requestError, "Failed to log out."));
    }
  };

  const isAuthenticated = authentication === "authenticated";

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
          {isAuthenticated ? (
            <button className={styles.button} onClick={() => void handleLogout()}>
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
      {authentication === "anonymous" && !loading && (
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
          <div key={food.id} className={styles.card}>
            <span>Dish</span>
            <h3>{food.name}</h3>
            <p className={styles.subtle}>{food.imageUrl || "No image"}</p>
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

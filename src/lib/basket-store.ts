"use client";

import { useSyncExternalStore } from "react";

/** Basket = product id → quantity, kept in the visitor's browser. */
export type Basket = Record<string, number>;

const KEY = "basket:v1";
const EMPTY: Basket = {};
const listeners = new Set<() => void>();
let basket: Basket = EMPTY;
let loaded = false;

function load() {
  if (loaded) return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) basket = JSON.parse(raw) as Basket;
  } catch {
    /* storage blocked or corrupt — start empty */
  }
}

function commit(next: Basket) {
  basket = next;
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* storage unavailable — basket still works for this visit */
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  // Keep several open tabs in sync.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== KEY) return;
    loaded = false;
    basket = EMPTY;
    load();
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot() {
  load();
  return basket;
}

export function useBasket(): Basket {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}

export function useBasketCount() {
  return Object.values(useBasket()).reduce((n, q) => n + q, 0);
}

export function setQuantity(id: string, qty: number) {
  load();
  const next = { ...basket };
  if (qty > 0) next[id] = Math.min(Math.round(qty), 99);
  else delete next[id];
  commit(next);
}

export function clearBasket() {
  commit({});
}

/* The basket sheet listens for this, so any button anywhere can open it without a provider. */
export function openBasket() {
  window.dispatchEvent(new Event("shop:open-basket"));
}

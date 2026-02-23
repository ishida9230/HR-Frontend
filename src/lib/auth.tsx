"use client";

import React, { createContext, useContext, useState } from "react";
// TODO: Firebase認証を有効にする際はコメントを外す
// import {
//   User,
//   signInWithEmailAndPassword,
//   signOut as firebaseSignOut,
//   onAuthStateChanged,
// } from "firebase/auth";
// import { auth } from "./firebase";

// モックユーザー型（開発用）
interface MockUser {
  uid: string;
  email: string;
  metadata?: {
    lastSignInTime?: string;
  };
}

interface AuthContextType {
  user: MockUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // TODO: Firebase認証を有効にする際は以下を使用
  // const [user, setUser] = useState<User | null>(null);

  // 開発用：モックユーザー状態
  const [user, setUser] = useState<MockUser | null>(null);
  const [loading] = useState(false);

  // TODO: Firebase認証を有効にする際はコメントを外す
  // useEffect(() => {
  //   if (!auth) {
  //     setLoading(false);
  //     return;
  //   }
  //   const unsubscribe = onAuthStateChanged(auth, (user) => {
  //     setUser(user);
  //     setLoading(false);
  //   });
  //   return () => unsubscribe();
  // }, []);

  const signIn = async (email: string, password: string) => {
    // TODO: Firebase認証を有効にする際はコメントを外す
    // if (!auth) {
    //   throw new Error("Firebase is not configured.");
    // }
    // await signInWithEmailAndPassword(auth, email, password);

    // 開発用：モックログイン（常に成功）
    console.log("Mock login:", email, password);
    setUser({
      uid: "mock-user-id",
      email: email,
      metadata: {
        lastSignInTime: new Date().toISOString(),
      },
    });
  };

  const signOut = async () => {
    // TODO: Firebase認証を有効にする際はコメントを外す
    // if (!auth) return;
    // await firebaseSignOut(auth);

    // 開発用：モックログアウト
    setUser(null);
  };

  const getIdToken = async (): Promise<string | null> => {
    if (!user) return null;
    // TODO: Firebase認証を有効にする際は user.getIdToken() を使用
    return "mock-token";
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, getIdToken }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

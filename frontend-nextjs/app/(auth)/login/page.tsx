import { Metadata } from "next";
import LoginForm from "./components/LoginForm";
import React, { Suspense } from 'react';
export const metadata: Metadata = {
  title: "Login",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </Suspense>
  );

}
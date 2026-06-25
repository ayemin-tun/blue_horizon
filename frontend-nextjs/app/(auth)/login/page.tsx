import { Metadata } from "next";
import LoginForm from "./components/LoginForm";

export const metadata: Metadata = {
  title: "BlueHorizon-Login",
};

export default function LoginPage() {
  return <LoginForm />;
}
import { Metadata } from "next";
import ForgotPasswordForm from "./components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "BlueHorizon-Forgot Password",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
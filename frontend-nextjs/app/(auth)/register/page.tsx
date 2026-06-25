import { Metadata } from "next";
import RegisterForm from "./components/RegisterForm";

export const metadata: Metadata = {
  title: "BlueHorizon-Register",
};

export default function RegisterPage() {
  return <RegisterForm />;
}
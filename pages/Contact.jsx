import React from "react";
import ContactForm from "../components/ContactForm";
import { useTheme } from "../components/ui/Theme";

export default function Contact() {
  const { language, t } = useTheme();

  return (
    <div className="py-8 bg-light-bg dark:bg-dark-bg">
      <ContactForm />
    </div>
  );
}
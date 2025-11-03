'use client';
import LandingHeader from '@/components/LandingHeader/LandingHeader';
import LandingHero from '@/components/LandingHero/LandingHero';
import Features from '@/components/Features/Features';
import Pricing from '@/components/Pricing/Pricing';
import ContactForm from '@/components/ContactForm/ContactForm';
import Footer from '@/components/Footer/Footer';
import React from 'react';
import "@/styles/globals.scss";

export default function Home() {
  return (
    <div>
      <LandingHeader />
      <LandingHero />
      <Features />
      <Pricing />
      <ContactForm />
      <Footer />
    </div>
  );
}

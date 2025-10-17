import React from "react";
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <section className="pt-8 sm:pt-10 md:pt-14">
        <div className="container-mobile grid md:grid-cols-2 gap-6 md:gap-10 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight">
              Le futur des <span className="text-[#38ff73]">pronostics</span> sportifs
            </h1>
            <p className="mt-3 text-gray-300 text-sm sm:text-base">
              Accède aux analyses FlashProno, mises à jour quotidiennement. Essai gratuit et abonnements flexibles.
            </p>
            <div className="mt-5 flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link to="/abonnements" className="btn btn-primary w-full sm:w-auto px-5 py-3 text-base">Voir les abonnements</Link>
              <a href="https://wa.me/33695962084" target="_blank" rel="noreferrer" className="btn btn-outline w-full sm:w-auto px-5 py-3 text-base">WhatsApp</a>
            </div>
          </div>
          <div className="order-first md:order-none">
            <div className="aspect-video rounded-2xl border border-[#1f1f1f] bg-gradient-to-br from-[#0f1a12] to-[#0b0b0b]" />
          </div>
        </div>
      </section>

      <section className="mt-10 sm:mt-12 md:mt-16">
        <div className="container-mobile grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {[
            ["Analyses quotidiennes","Pronostics mis à jour chaque jour."],
            ["Essai gratuit","Testez 14 jours sans engagement."],
            ["Paiement sécurisé","Stripe — mensuel ou annuel."],
          ].map(([t,s],i)=>(
            <div key={i} className="card p-5">
              <h3 className="font-bold text-lg">{t}</h3>
              <p className="text-gray-400 text-sm mt-1">{s}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

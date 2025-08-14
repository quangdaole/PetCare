"use client";

import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import PetTracking from "./components/pet-tracking/PetTracking";
import HealthRecords from "./components/health/HealthRecords";
import Reminders from "./components/reminders/Reminders";
import Statistics from "./components/stats/Statistics";
import Dashboard from "./components/dashboard/Dashboard";
type FeatureKey = "pet-tracking" | "health" | "reminders" | "stats" | "dashboard";

const pets = [
  { id: "pet-1", name: "Mochi" },
  { id: "pet-2", name: "Bella" },
  { id: "pet-3", name: "Max" },
  { id: "pet-4", name: "Luna" },
  { id: "pet-5", name: "Charlie" }
];

export default function Page() {
  const [feature, setFeature] = useState<FeatureKey | null>(null);
  const [selectedPetId, setSelectedPetId] = useState(pets[0].id);

  const selectedPet = pets.find((p) => p.id === selectedPetId)!;

  return (
    <>
      <Header onSelectFeature={(key) => setFeature(key)} />

      <main>
        {feature === "pet-tracking" && (
          <section className="container-app py-8">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="title-xl mb-2">Pet Tracking</h2>
                <select
                  className="rounded border px-3 py-2"
                  value={selectedPetId}
                  onChange={(e) => setSelectedPetId(e.target.value)}
                >
                  {pets.map((pet) => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="btn btn-ghost"
                onClick={() => setFeature(null)}
                aria-label="Close Pet Tracking"
              >
                Close
              </button>
            </div>
            <PetTracking pet={selectedPet} />
            <div className="divider" />
          </section>
        )}
      {feature === "health" && (
        <section className="container-app py-8">
          <div className="mb-4 flex items-center justify-between">
           <h2 className="title-xl">Health Records</h2>
            <button className="btn btn-ghost" onClick={() => setFeature(null)} aria-label="Close Health Records">
             Close
            </button>
             </div>

       {/* assuming you already have selectedPet from your pets dropdown */}
       <HealthRecords petId={selectedPet.id} petName={selectedPet.name} />
        <div className="divider" />
        </section>
      )}
    {feature === "reminders" && (
    <section className="container-app py-8">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="title-xl">Reminders</h2>
        <button
          className="btn btn-ghost"
          onClick={() => setFeature(null)}
          aria-label="Close Reminders"
        >
          Close
        </button>
      </div>

    {/* assuming you already have a selectedPet from your dropdown */}
    <Reminders petId={selectedPet.id} petName={selectedPet.name} />
    <div className="divider" />
  </section>
)}
{feature === "stats" && (
  <section className="container-app py-8">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="title-xl">Statistics</h2>
      <button className="btn btn-ghost" onClick={() => setFeature(null)}>Close</button>
    </div>
    <Statistics petId={selectedPet.id} petName={selectedPet.name} />
    <div className="divider" />
  </section>
)}
{feature === "dashboard" && (
  <section className="container-app py-8">
    <div className="mb-4 flex items-center justify-between">
      <h2 className="title-xl">Dashboard</h2>
      <button className="btn btn-ghost" onClick={() => setFeature(null)}>Close</button>
    </div>

    {/* assuming you already have selectedPet from your dropdown */}
    <Dashboard
      petId={selectedPet.id}
      petName={selectedPet.name}
      onOpenFeature={(k) => setFeature(k)}
    />
    <div className="divider" />
  </section>
)}


        {/* Hero */}
        <section className="hero relative">
          {/* soft background glows */}
          <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute left-6 top-8 h-40 w-40 rounded-full bg-blue-300/20 blur-2xl" />
            <div className="absolute right-8 bottom-8 h-56 w-56 rounded-full bg-pink-300/20 blur-3xl" />
          </div>

          <h1 className="hero-title">
            Welcome to <span className="text-blue-700">PetCare</span>
          </h1>
          <p className="hero-lead">
            Track your pet’s health, activities, and reminders — all in one place.
          </p>

          <div className="mt-8 flex items-center justify-center gap-3">
            <a href="/dashboard" className="btn btn-primary btn-lg">Get Started</a>
            <a href="#features" className="btn btn-ghost btn-lg">See Features</a>
          </div>
        </section>

        {/* Features 
        <section id="features" className="py-16">
          <div className="container-app">
            <h2 className="title-xl text-center mb-2">App Features</h2>
            <p className="lead text-center mb-10">Everything you need for day-to-day pet care.</p>

            <div className="grid-3">
              <div className="section text-center">
                <h3 className="subtitle">Pet Profiles</h3>
                <p className="muted">
                  Keep details in one place: name, breed, age, vaccines, notes, and more.
                </p>
              </div>

              <div className="section text-center">
                <h3 className="subtitle">Care Scheduling</h3>
                <p className="muted">
                  Reminders for vet visits, medication, and feeding so nothing slips.
                </p>
              </div>

              <div className="section text-center">
                <h3 className="subtitle">Activity Tracking</h3>
                <p className="muted">
                  Log walks, feedings, and play — visualize trends with interactive D3 charts.
                </p>
              </div>
            </div>

            <div className="divider" />
          </div>
        </section>
*/}

        {/* How it works 
        <section className="py-16">
          <div className="container-app">
            <h2 className="title-xl text-center mb-2">How It Works</h2>
            <p className="lead text-center mb-10">Three simple steps to get value fast.</p>

            <div className="grid-3">
              <div className="section">
                <span className="badge mb-3">Step 1</span>
                <h3 className="subtitle">Create a Pet</h3>
                <p className="muted">Add a profile with basic info and an optional photo.</p>
              </div>
              <div className="section">
                <span className="badge mb-3">Step 2</span>
                <h3 className="subtitle">Log Activities</h3>
                <p className="muted">Record walks, feedings, meds, and vet visits as they happen.</p>
              </div>
              <div className="section">
                <span className="badge mb-3">Step 3</span>
                <h3 className="subtitle">See Insights</h3>
                <p className="muted">Use charts to spot patterns and keep a healthy routine.</p>
              </div>
            </div>
          </div>
        </section>
*/}
      </main>

      <Footer />
    </>
  );
}

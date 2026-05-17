import React from 'react';
import Link from 'next/link';
import { Header } from "@/components/Header";

// High-fidelity Mock Data for Demo
const mockStats = [
  { label: 'Total Members', count: 42, icon: '👥' },
  { label: 'Active Projects', count: 18, icon: '📁' },
  { label: 'Theses Completed', count: 29, icon: '🎓' },
  { label: 'Publications', count: 154, icon: '📄' },
];

const mockMembers = [
  { name: 'Dr. Alejandro Silva', role: 'Lab Director / CONICET Researcher', slug: 'alejandro-silva', avatar: '👨‍🔬' },
  { name: 'Mg. Brenda Rossi', role: 'PhD Student / Assistant Professor', slug: 'brenda-rossi', avatar: '👩‍💻' },
  { name: 'Dr. Carlos Mendoza', role: 'Senior Researcher', slug: 'carlos-mendoza', avatar: '👨‍💻' },
];

const mockPublications = [
  {
    title: 'A Semantic Web Architecture for Open Research Repositories',
    authors: 'Silva, A., Mendoza, C., & Rossi, B.',
    journal: 'Journal of Web Semantics',
    year: 2025,
    type: 'article',
  },
  {
    title: 'Decentralized Agent Coordination in Edge Computing Environments',
    authors: 'Rossi, B., & Silva, A.',
    journal: 'IEEE Transactions on Services Computing',
    year: 2024,
    type: 'article',
  },
];

export default async function Home() {
  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Unified Header */}
      <Header />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-12">
        {/* Welcome Section */}
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 border border-secondary/20 text-xs font-semibold text-secondary">
            🚀 Technology Migration complete (Next.js + Postgres)
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Welcome to <span className="text-gradient-primary">Memorias</span>
          </h1>
          <p className="text-lg text-muted max-w-2xl">
            A state-of-the-art research repository and laboratory management portal. Manage projects, track publications, archive theses, and display member metrics.
          </p>
        </section>

        {/* Statistics Grid */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {mockStats.map((stat, i) => (
            <div key={i} className="material-card flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted uppercase tracking-wider">{stat.label}</span>
                <h3 className="text-3xl font-extrabold text-primary dark:text-white">{stat.count}</h3>
              </div>
              <span className="text-3xl p-3 bg-primary/5 dark:bg-primary/20 rounded-xl">{stat.icon}</span>
            </div>
          ))}
        </section>

        {/* Members & Recent Work Grid */}
        <section className="grid md:grid-cols-3 gap-8">
          {/* Members Column */}
          <div className="md:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Featured Members</h2>
              <Link href="/members" className="text-sm font-semibold text-secondary hover:text-secondary-hover">View All</Link>
            </div>
            <div className="space-y-4">
              {mockMembers.map((member, i) => (
                <div key={i} className="interactive-item gap-4">
                  <span className="text-2xl p-2 bg-primary/5 rounded-lg">{member.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm truncate text-primary dark:text-white">{member.name}</h4>
                    <p className="text-xs text-muted truncate">{member.role}</p>
                  </div>
                  <span className="text-secondary font-bold">→</span>
                </div>
              ))}
            </div>
          </div>

          {/* Publications Column */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight">Recent Publications</h2>
              <Link href="/publications" className="text-sm font-semibold text-secondary hover:text-secondary-hover">Browse BibTex</Link>
            </div>
            <div className="space-y-4">
              {mockPublications.map((pub, i) => (
                <div key={i} className="material-card space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary uppercase">
                      {pub.type}
                    </span>
                    <span className="text-xs font-semibold text-muted">{pub.year}</span>
                  </div>
                  <h3 className="text-base font-bold text-primary dark:text-white hover:underline cursor-pointer">
                    {pub.title}
                  </h3>
                  <p className="text-sm text-muted">{pub.authors}</p>
                  <p className="text-xs font-medium text-slate-400 italic">{pub.journal}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface/50 py-8 text-center text-xs text-muted">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} Memorias System. Open Source Migration Project.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Semantic Web RDF</a>
            <span>•</span>
            <a href="#" className="hover:underline">MCP Server API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

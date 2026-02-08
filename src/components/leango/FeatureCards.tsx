import { ReactNode } from 'react';

interface FeatureCard {
  icon?: ReactNode;
  iconColor?: string;
  title: string;
  description: string;
}

interface FeatureCardsProps {
  cards: FeatureCard[];
  columns?: 2 | 3 | 4;
  variant?: 'light' | 'dark' | 'glass';
}

export function FeatureCards({ cards, columns = 3, variant = 'light' }: FeatureCardsProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  if (variant === 'glass') {
    return (
      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="group relative bg-white/5 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-white/10 hover:border-[#00a1f1]/50 transition-all duration-300 hover:-translate-y-1"
          >
            {/* Gradient glow on hover */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#00a1f1]/10 to-[#66d200]/10 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative">
              {card.icon && (
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                  card.iconColor || 'bg-[#00a1f1]/20 text-[#00a1f1]'
                }`}>
                  {card.icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
              <p className="text-gray-400 leading-relaxed">{card.description}</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dark') {
    return (
      <div className={`grid gap-6 ${gridCols[columns]}`}>
        {cards.map((card, index) => (
          <div
            key={index}
            className="group bg-gray-800/50 rounded-2xl p-6 lg:p-8 border border-gray-700/50 hover:border-[#00a1f1]/50 transition-all duration-300"
          >
            {card.icon && (
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                card.iconColor || 'bg-[#00a1f1]/20 text-[#00a1f1]'
              }`}>
                {card.icon}
              </div>
            )}
            <h3 className="text-xl font-semibold text-white mb-3">{card.title}</h3>
            <p className="text-gray-400 leading-relaxed">{card.description}</p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:border-[#00a1f1]/30 transition-all duration-300"
        >
          {card.icon && (
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                card.iconColor || 'bg-[#00a1f1]/10 text-[#00a1f1]'
              }`}
            >
              {card.icon}
            </div>
          )}
          <h3 className="text-xl font-semibold text-gray-900 mb-3">{card.title}</h3>
          <p className="text-gray-600 leading-relaxed">{card.description}</p>
        </div>
      ))}
    </div>
  );
}

// Pre-built icon components
export const FeatureIcons = {
  chart: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  users: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  lightbulb: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  cog: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  check: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  clock: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  target: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
    </svg>
  ),
  document: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  code: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  ),
  trending: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
};

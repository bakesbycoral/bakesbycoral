import Link from 'next/link';

interface UseCase {
  title: string;
  description?: string;
  outcomes?: string[];
  href?: string;
}

interface UseCaseGridProps {
  cases: UseCase[];
  columns?: 2 | 3 | 4;
  variant?: 'light' | 'dark';
}

export function UseCaseGrid({ cases, columns = 3, variant = 'light' }: UseCaseGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  };

  const isDark = variant === 'dark';

  return (
    <div className={`grid gap-6 ${gridCols[columns]}`}>
      {cases.map((useCase, index) => {
        const content = (
          <div className={`group rounded-2xl p-6 lg:p-8 h-full transition-all duration-300 ${
            isDark
              ? 'bg-gray-800/50 border border-gray-700/50 hover:border-[#00a1f1]/50 hover:bg-gray-800/80'
              : 'bg-white border border-gray-200 hover:border-[#00a1f1]/50 hover:shadow-lg'
          }`}>
            <div className="flex items-start justify-between mb-4">
              <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {useCase.title}
              </h3>
              {useCase.href && (
                <svg
                  className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${
                    isDark ? 'text-[#00a1f1]' : 'text-[#00a1f1]'
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              )}
            </div>

            {useCase.description && (
              <p className={`text-sm mb-4 leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {useCase.description}
              </p>
            )}

            {useCase.outcomes && useCase.outcomes.length > 0 && (
              <ul className="space-y-2">
                {useCase.outcomes.map((outcome, i) => (
                  <li key={i} className={`flex items-start gap-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 text-[#66d200] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {outcome}
                  </li>
                ))}
              </ul>
            )}
          </div>
        );

        if (useCase.href) {
          return (
            <Link key={index} href={useCase.href} className="block">
              {content}
            </Link>
          );
        }

        return <div key={index}>{content}</div>;
      })}
    </div>
  );
}

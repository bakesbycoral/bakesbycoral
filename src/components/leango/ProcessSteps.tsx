interface Step {
  number?: number;
  title: string;
  description: string;
}

interface ProcessStepsProps {
  steps: Step[];
  variant?: 'numbered' | 'cards' | 'timeline' | 'horizontal';
}

export function ProcessSteps({ steps, variant = 'numbered' }: ProcessStepsProps) {
  if (variant === 'horizontal') {
    return (
      <div className="relative">
        {/* Connecting line */}
        <div className="hidden lg:block absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00a1f1] via-[#66d200] to-[#00a1f1]" />

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="relative text-center">
              {/* Step number */}
              <div className="relative z-10 w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#00a1f1] to-[#0091d8] text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#00a1f1]/25">
                {step.number || index + 1}
              </div>

              <h3 className="mt-6 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-gray-400 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'timeline') {
    return (
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 lg:left-1/2 lg:-translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#00a1f1] to-[#66d200]" />

        <div className="space-y-12">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`relative flex gap-6 lg:gap-12 ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              }`}
            >
              {/* Number circle */}
              <div className="absolute left-0 lg:left-1/2 lg:-translate-x-1/2 w-8 h-8 rounded-full bg-[#00a1f1] text-white flex items-center justify-center text-sm font-bold z-10 shadow-lg shadow-[#00a1f1]/30">
                {step.number || index + 1}
              </div>

              {/* Content */}
              <div className={`pl-12 lg:pl-0 lg:w-1/2 ${index % 2 === 0 ? 'lg:pr-12 lg:text-right' : 'lg:pl-12'}`}>
                <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-gray-400">{step.description}</p>
              </div>

              {/* Spacer for alternating layout */}
              <div className="hidden lg:block lg:w-1/2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'cards') {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
        {steps.map((step, index) => (
          <div
            key={index}
            className="group relative bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50 hover:border-[#00a1f1]/50 transition-all duration-300"
          >
            {/* Step number with gradient */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a1f1] to-[#0091d8] text-white flex items-center justify-center text-xl font-bold mb-4 shadow-lg shadow-[#00a1f1]/20">
              {step.number || index + 1}
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-gray-400 leading-relaxed">{step.description}</p>

            {/* Connector arrow (except for last item) */}
            {index < steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10 w-4 h-4 items-center justify-center">
                <svg className="w-4 h-4 text-[#00a1f1]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }

  // Default numbered list
  return (
    <div className="space-y-8">
      {steps.map((step, index) => (
        <div key={index} className="flex gap-6">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#00a1f1] to-[#0091d8] text-white flex items-center justify-center text-xl font-bold shadow-lg shadow-[#00a1f1]/20">
            {step.number || index + 1}
          </div>
          <div className="pt-1">
            <h3 className="text-xl font-semibold text-white">{step.title}</h3>
            <p className="mt-2 text-gray-400">{step.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

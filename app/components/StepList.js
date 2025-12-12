export default function StepList({ steps }) {
  return (
    <div className="glass-card p-6" style={{ borderRadius: '20px' }}>
      <h2
        className="text-2xl font-bold mb-4"
        style={{
          fontFamily: 'var(--font-outfit)',
          color: 'var(--glass-white)',
          textShadow: '0 2px 12px rgba(0, 212, 255, 0.5)'
        }}
      >
        Instructions
      </h2>

      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start">
            {/* Step number with gradient glow */}
            <span
              className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold mr-4 mt-0.5"
              style={{
                background: 'linear-gradient(135deg, var(--deep-purple), var(--royal-purple))',
                color: 'var(--glass-white)',
                boxShadow: '0 0 16px rgba(107, 45, 255, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {index + 1}
            </span>

            {/* Step text - large and readable for cooking */}
            <p className="flex-1 text-lg leading-relaxed" style={{ color: 'var(--glass-white)' }}>
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

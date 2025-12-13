export default function StepList({ steps }) {
  return (
    <div className="editorial-card p-8">
      <h2 className="heading-section" style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>
        Instructions
      </h2>

      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start">
            {/* Step number */}
            <span
              className="shrink-0 w-10 h-10 flex items-center justify-center font-bold mr-4 mt-0.5"
              style={{
                background: 'var(--charcoal)',
                color: 'var(--white)',
                borderRadius: '50%',
                fontFamily: 'var(--font-crimson)',
                fontSize: '1.125rem'
              }}
            >
              {index + 1}
            </span>

            {/* Step text - large and readable for cooking */}
            <p className="flex-1 body-text" style={{ fontSize: '1.063rem', lineHeight: '1.75' }}>
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

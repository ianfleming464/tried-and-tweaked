export default function StepList({ steps }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-bold text-neutral-900 mb-4">Instructions</h2>

      <ol className="space-y-6">
        {steps.map((step, index) => (
          <li key={step.id} className="flex items-start">
            {/* Step number */}
            <span className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold mr-4 mt-0.5">
              {index + 1}
            </span>

            {/* Step text - large and readable for cooking */}
            <p className="flex-1 text-neutral-800 text-lg leading-relaxed">
              {step.text}
            </p>
          </li>
        ))}
      </ol>
    </div>
  );
}

// The two dashes and "Step 1 of 2" at the top of a memory screen
export function StepBar({ step, stepCount }) {
  return (
    <div className="step-bar">
      <span className="step-dashes" aria-hidden="true">
        {Array.from({ length: stepCount }, (_, index) => (
          <span className={`step-dash${index < step ? ' is-done' : ''}`} key={index} />
        ))}
      </span>
      <span className="step-label">
        Step {step} of {stepCount}
      </span>
    </div>
  )
}

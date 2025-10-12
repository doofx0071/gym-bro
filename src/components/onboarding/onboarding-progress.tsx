import { Progress } from "@/components/ui/progress"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
}

const steps = [
  { number: 1, label: "Physical" },
  { number: 2, label: "Fitness" },
  { number: 3, label: "Activity" },
  { number: 4, label: "Dietary" },
]

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </p>
          <p className="text-2xl font-bold">
            {steps[currentStep - 1]?.label}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
            {Math.round(progress)}% Complete
          </p>
        </div>
      </div>

      <Progress value={progress} className="h-2 mb-6" />

      {/* Step indicators */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center font-semibold transition-colors",
                  currentStep > step.number
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.number
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.number ? (
                  <Check className="h-5 w-5" />
                ) : (
                  step.number
                )}
              </div>
              <p
                className={cn(
                  "text-xs mt-2 font-medium",
                  currentStep >= step.number
                    ? "text-foreground"
                    : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-12 lg:w-24 mx-2 transition-colors",
                  currentStep > step.number
                    ? "bg-primary"
                    : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


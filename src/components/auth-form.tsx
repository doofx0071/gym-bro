'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp'
import { Eye, EyeOff, Loader2, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { login, signup, verifyOtp, resendOtp } from '@/app/auth/actions'
import Link from 'next/link'
import { UnsplashPhoto } from '@/components/unsplash-photo'

type AuthMode = 'login' | 'register' | 'otp' | 'forgot-password'

interface AuthFormProps extends React.ComponentProps<'div'> {
  initialMode?: AuthMode
}

export function AuthForm({ className, initialMode = 'login', ...props }: AuthFormProps) {
  const router = useRouter()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  // Handle OTP input to allow only numbers
  const handleOTPChange = (value: string) => {
    // Only allow numbers, remove any letters or symbols
    const numericValue = value.replace(/[^0-9]/g, '')
    setOtp(numericValue)
  }

  // Handle login
  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const emailValue = formData.get('email') as string
    setEmail(emailValue)

    const result = await login(formData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else if (result.requiresOtp) {
      toast.success('OTP sent to your email!')
      sessionStorage.setItem('otp_email', emailValue)
      setMode('otp')
      setIsLoading(false)
    }
  }

  // Handle register
  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      toast.error('Please agree to the Terms and Conditions')
      setIsLoading(false)
      return
    }

    const result = await signup(formData)

    if (result.error) {
      toast.error(result.error)
      setIsLoading(false)
    } else {
      toast.success(result.message)
      router.push('/auth/verify-email')
    }
  }

  // Handle OTP verification
  async function handleVerifyOtp() {
    if (otp.length !== 8) {
      toast.error('Please enter the complete 8-digit code')
      return
    }

    // Additional validation to ensure OTP contains only numbers
    if (!/^\d{8}$/.test(otp)) {
      toast.error('OTP must contain only numbers')
      return
    }

    setIsLoading(true)
    const result = await verifyOtp(email, otp)
    console.log('🔐 Verification result from server:', result)

    if (result?.error) {
      toast.error(result.error)
      setIsLoading(false)
      return
    }

    if (result?.success) {
      toast.success('Successfully logged in!')
      console.log('🎉 Redirecting to:', result.redirectTo)
      // Redirect based on the result (onboarding for new users, dashboard for existing users)
      setTimeout(() => {
        if (result.redirectTo) {
          router.push(result.redirectTo)
        } else {
          // Fallback to onboarding if no redirect specified
          router.push('/onboarding')
        }
      }, 500) // Standard delay for UI feedback
    }
    
    setIsLoading(false)
  }

  // Handle resend OTP
  async function handleResendOtp() {
    setIsLoading(true)
    const result = await resendOtp(email)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
    }
    setIsLoading(false)
  }

  // Handle forgot password
  async function handleForgotPassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    // TODO: Implement forgot password logic
    toast.info('Password reset link sent to your email')
    setIsLoading(false)
    setMode('login')
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          {/* Left Side - Form */}
          <div className="p-6 md:p-8">
            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Log in to continue your fitness journey
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </Field>
                  <Field>
                    <div className="flex items-center">
                      <FieldLabel htmlFor="password">Password</FieldLabel>
                      <button
                        type="button"
                        onClick={() => setMode('forgot-password')}
                        className="ml-auto text-sm underline-offset-2 hover:underline cursor-pointer"
                      >
                        Forgot your password?
                      </button>
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        className="pr-10 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Log in
                    </Button>
                  </Field>
                  <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                    Or continue with
                  </FieldSeparator>
                  <Field>
                    <Button variant="outline" type="button" className="w-full cursor-pointer" disabled title="Google sign-in coming soon">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Log in with Google
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className="underline cursor-pointer"
                    >
                      Sign up
                    </button>
                  </FieldDescription>
                </FieldGroup>
              </form>
            )}

            {/* Register Form */}
            {mode === 'register' && (
              <form onSubmit={handleRegister}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Create an account</h1>
                    <p className="text-muted-foreground text-balance">
                      Start your fitness journey today
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel htmlFor="firstName">First Name</FieldLabel>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        required
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                    </Field>
                    <Field>
                      <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        required
                        disabled={isLoading}
                        className="cursor-pointer"
                      />
                    </Field>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        className="pr-10 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        disabled={isLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <Field>
                    <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        disabled={isLoading}
                        className="pr-10 cursor-pointer"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                      disabled={isLoading}
                      className="cursor-pointer mt-1"
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      I agree to the{' '}
                      <Link href="/terms" className="font-medium underline underline-offset-4 cursor-pointer">
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="font-medium underline underline-offset-4 cursor-pointer">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  <Field>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Sign up
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="underline cursor-pointer"
                    >
                      Log in
                    </button>
                  </FieldDescription>
                </FieldGroup>
              </form>
            )}

            {/* OTP Verification Form */}
            {mode === 'otp' && (
              <div>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="self-start mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </button>
                    <h1 className="text-2xl font-bold">Verify your email</h1>
                    <p className="text-muted-foreground text-balance">
                      We&apos;ve sent an 8-digit code to
                    </p>
                    <p className="text-sm font-medium">{email}</p>
                  </div>
                  <div className="flex flex-col items-center space-y-4">
                    <FieldLabel>Enter verification code</FieldLabel>
                    <InputOTP
                      maxLength={8}
                      value={otp}
                      onChange={handleOTPChange}
                      disabled={isLoading}
                      className="cursor-pointer"
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} className="cursor-pointer" />
                        <InputOTPSlot index={1} className="cursor-pointer" />
                        <InputOTPSlot index={2} className="cursor-pointer" />
                        <InputOTPSlot index={3} className="cursor-pointer" />
                        <InputOTPSlot index={4} className="cursor-pointer" />
                        <InputOTPSlot index={5} className="cursor-pointer" />
                        <InputOTPSlot index={6} className="cursor-pointer" />
                        <InputOTPSlot index={7} className="cursor-pointer" />
                      </InputOTPGroup>
                    </InputOTP>
                    <p className="text-xs text-muted-foreground">
                      Enter the 8-digit numeric code from your email
                    </p>
                  </div>
                  <Field>
                    <Button
                      onClick={handleVerifyOtp}
                      className="w-full cursor-pointer"
                      disabled={isLoading || otp.length !== 8}
                    >
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify
                    </Button>
                  </Field>
                  <FieldDescription className="text-center">
                    Didn&apos;t receive the code?{' '}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={isLoading}
                      className="underline cursor-pointer disabled:opacity-50"
                    >
                      Resend OTP
                    </button>
                  </FieldDescription>
                </FieldGroup>
              </div>
            )}

            {/* Forgot Password Form */}
            {mode === 'forgot-password' && (
              <form onSubmit={handleForgotPassword}>
                <FieldGroup>
                  <div className="flex flex-col items-center gap-2 text-center">
                    <button
                      type="button"
                      onClick={() => setMode('login')}
                      className="self-start mb-2 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to login
                    </button>
                    <h1 className="text-2xl font-bold">Reset your password</h1>
                    <p className="text-muted-foreground text-balance">
                      Enter your email and we&apos;ll send you a reset link
                    </p>
                  </div>
                  <Field>
                    <FieldLabel htmlFor="email">Email</FieldLabel>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      required
                      disabled={isLoading}
                      className="cursor-pointer"
                    />
                  </Field>
                  <Field>
                    <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send reset link
                    </Button>
                  </Field>
                </FieldGroup>
              </form>
            )}
          </div>

          {/* Right Side - Image */}
          <div className="bg-muted relative hidden md:block">
            <UnsplashPhoto 
              className="h-full w-full"
              alt="Gym fitness workout"
            />
          </div>
        </CardContent>
      </Card>
      <FieldDescription className="px-6 text-center">
        By clicking continue, you agree to our{' '}
        <Link href="/terms" className="underline cursor-pointer">
          Terms of Service
        </Link>{' '}
        and{' '}
        <Link href="/privacy" className="underline cursor-pointer">
          Privacy Policy
        </Link>
        .
      </FieldDescription>
    </div>
  )
}


import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mail } from 'lucide-react'

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Mail className="h-12 w-12 text-primary" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Check your email</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            We&apos;ve sent you a verification link to confirm your email address.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check your inbox and click the link to verify your account.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">Note:</strong> The verification link
              will expire in 24 hours. If you don&apos;t see the email, check your spam folder.
            </p>
          </div>

          <Button asChild variant="outline" className="w-full">
            <Link href="/auth/login">Back to login</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}


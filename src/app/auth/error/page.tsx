import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertCircle className="h-12 w-12 text-destructive" />
          </div>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Authentication Error</h1>
          <p className="mt-4 text-sm text-muted-foreground">
            We encountered an error while trying to authenticate you.
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            This could be due to an expired or invalid verification link.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="text-sm text-muted-foreground">
              <strong className="font-medium text-foreground">What to do:</strong>
            </p>
            <ul className="mt-2 space-y-1 text-left text-sm text-muted-foreground">
              <li>• Try logging in again</li>
              <li>• Request a new verification email</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>

          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/auth/login">Back to login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Go to homepage</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}


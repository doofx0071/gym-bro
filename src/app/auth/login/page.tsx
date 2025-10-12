import { AuthForm } from '@/components/auth-form'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {/* Back to Home Button */}
      <div className="absolute top-4 right-4">
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="w-full max-w-sm md:max-w-4xl">
        <AuthForm initialMode="login" />
      </div>
    </div>
  )
}


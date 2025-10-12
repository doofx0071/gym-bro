'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background px-4 py-12">
      {/* Back to Home Button */}
      <div className="absolute top-4 right-4">
        <Link href="/">
          <Button variant="outline" className="cursor-pointer">
            Back to Home
          </Button>
        </Link>
      </div>

      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary via-red-500 to-orange-500 bg-clip-text text-transparent">
            Terms and Conditions
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              By accessing and using Gym Bro (&quot;the Service&quot;), you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            <p>
              If you do not agree to these Terms and Conditions, please do not use the Service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. Use of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Gym Bro provides AI-powered fitness and nutrition planning services. You agree to use the Service only for lawful purposes and in accordance with these Terms.
            </p>
            <p>
              You are responsible for:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Ensuring the accuracy of information you provide</li>
              <li>Consulting with healthcare professionals before starting any fitness program</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Health and Safety Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p className="font-semibold text-foreground">
              IMPORTANT: Gym Bro is not a substitute for professional medical advice, diagnosis, or treatment.
            </p>
            <p>
              Always consult with a qualified healthcare provider before beginning any exercise program or making dietary changes. The workout and meal plans provided are AI-generated suggestions and may not be suitable for everyone.
            </p>
            <p>
              You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Physical exercise involves inherent risks</li>
              <li>You should stop exercising if you experience pain or discomfort</li>
              <li>Gym Bro is not liable for any injuries or health issues that may arise from using the Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. User Content and Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              You retain ownership of any data you submit to the Service. By using Gym Bro, you grant us permission to use your data to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Generate personalized workout and meal plans</li>
              <li>Improve our AI algorithms and services</li>
              <li>Provide customer support</li>
            </ul>
            <p>
              We will handle your data in accordance with our Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Intellectual Property</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              All content, features, and functionality of Gym Bro, including but not limited to text, graphics, logos, and software, are owned by Gym Bro and are protected by copyright, trademark, and other intellectual property laws.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Limitation of Liability</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              To the maximum extent permitted by law, Gym Bro shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Service.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Modifications to Terms</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by updating the &quot;Last updated&quot; date at the top of this page.
            </p>
            <p>
              Your continued use of the Service after changes constitutes acceptance of the modified Terms.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. Termination</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We reserve the right to terminate or suspend your account and access to the Service at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have any questions about these Terms and Conditions, please contact us through the app or visit our support page.
            </p>
          </CardContent>
        </Card>

        <div className="mt-8 text-center">
          <Link href="/auth/register">
            <Button className="cursor-pointer">
              I Accept - Continue to Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


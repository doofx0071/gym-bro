'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We collect information that you provide directly to us when using Gym Bro:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, password</li>
              <li><strong>Profile Data:</strong> Age, gender, height, weight, fitness level</li>
              <li><strong>Fitness Goals:</strong> Primary goals, activity level, dietary preferences</li>
              <li><strong>Health Information:</strong> Allergies, dietary restrictions</li>
              <li><strong>Usage Data:</strong> How you interact with our Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>2. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Create and manage your account</li>
              <li>Generate personalized workout and meal plans using AI</li>
              <li>Calculate your BMR, TDEE, and nutritional requirements</li>
              <li>Improve our AI algorithms and Service quality</li>
              <li>Send you important updates about the Service</li>
              <li>Provide customer support</li>
              <li>Ensure the security and integrity of our Service</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>3. Data Storage and Security</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Your data is stored securely using Supabase, a trusted database platform with enterprise-grade security:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>All data is encrypted in transit using SSL/TLS</li>
              <li>Passwords are hashed and never stored in plain text</li>
              <li>Row Level Security (RLS) ensures you can only access your own data</li>
              <li>Regular security audits and updates</li>
              <li>Data backups to prevent loss</li>
            </ul>
            <p className="mt-4">
              While we implement industry-standard security measures, no method of transmission over the Internet is 100% secure. We cannot guarantee absolute security.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>4. Data Sharing and Disclosure</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We do not sell your personal information. We may share your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Service Providers:</strong> With trusted third-party services (like Supabase) that help us operate the Service</li>
              <li><strong>Legal Requirements:</strong> If required by law or to protect our rights</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to share information</li>
            </ul>
            <p className="mt-4">
              We will never share your health or fitness data with advertisers or marketing companies.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>5. Your Rights and Choices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Update:</strong> Modify your profile information at any time</li>
              <li><strong>Delete:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us through the app settings or support page.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>6. Cookies and Tracking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We use cookies and similar technologies to:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Keep you logged in</li>
              <li>Remember your preferences</li>
              <li>Analyze how you use the Service</li>
              <li>Improve user experience</li>
            </ul>
            <p className="mt-4">
              You can control cookies through your browser settings, but this may affect Service functionality.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>7. Children&apos;s Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Gym Bro is not intended for users under the age of 13. We do not knowingly collect personal information from children under 13. If you believe we have collected information from a child under 13, please contact us immediately.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>8. International Data Transfers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data in accordance with this Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>9. Changes to This Policy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by updating the &quot;Last updated&quot; date and, where appropriate, sending you a notification.
            </p>
            <p>
              Your continued use of the Service after changes constitutes acceptance of the updated Privacy Policy.
            </p>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>10. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us through:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>The in-app support feature</li>
              <li>Your account settings page</li>
              <li>Our support email (available in the app)</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            By using Gym Bro, you acknowledge that you have read and understood this Privacy Policy.
          </p>
          <Link href="/auth/register">
            <Button className="cursor-pointer">
              I Understand - Continue to Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}


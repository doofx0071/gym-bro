'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

function getBaseUrl() {
  // Use NEXT_PUBLIC_SITE_URL if available (for production)
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  
  // Use VERCEL_URL for Vercel deployments
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000'
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const baseUrl = getBaseUrl()
  
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        first_name: formData.get('firstName') as string,
        last_name: formData.get('lastName') as string,
      },
      emailRedirectTo: `${baseUrl}/auth/callback`,
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Check your email to confirm your account!' }
}

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  // First validate credentials
  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  // If credentials are valid, sign them out and send OTP
  await supabase.auth.signOut()

  // Send OTP for verification
  const { error: otpError } = await supabase.auth.signInWithOtp({
    email: data.email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (otpError) {
    return { error: otpError.message }
  }

  return { success: true, requiresOtp: true }
}

export async function verifyOtp(email: string, token: string) {
  const supabase = await createClient()

  const { error, data } = await supabase.auth.verifyOtp({
    email,
    token,
    type: 'email',
  })

  if (error) {
    return { error: error.message }
  }

  // Check if user has completed onboarding by looking for their profile
  if (data?.user) {
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('auth_user_id', data.user.id)
      .single()

    if (profileError && profileError.code === 'PGRST116') {
      // No profile found - user needs onboarding
      revalidatePath('/', 'layout')
      return { success: true, redirectTo: '/onboarding' }
    } else if (profileData) {
      // Profile exists - user has completed onboarding
      revalidatePath('/', 'layout')
      return { success: true, redirectTo: '/dashboard' }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true, redirectTo: '/dashboard' }
}

export async function resendOtp(email: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'OTP sent to your email!' }
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

export async function resetPassword(email: string) {
  const supabase = await createClient()

  const baseUrl = getBaseUrl()
  
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${baseUrl}/auth/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, message: 'Password reset email sent!' }
}
'use client';
// app/(auth)/login/page.tsx
// Login page — credentials sign-in with React Hook Form + Zod
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState, Suspense } from 'react';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') ?? '/dashboard';
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    try {
      const result = await signIn('credentials', {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setServerError('Invalid email or password. Please try again.');
        return;
      }

      router.push(callbackUrl);
      router.refresh();
    } catch {
      setServerError('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Card */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm p-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-600 rounded-xl mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-900">Singam Portal</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error message */}
        {serverError && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-2.5 rounded-lg bg-danger-50 border border-danger-100 px-4 py-3 text-sm text-danger-700"
          >
            <svg
              className="w-4 h-4 mt-0.5 shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                clipRule="evenodd"
              />
            </svg>
            {serverError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              {...register('email')}
              aria-describedby={errors.email ? 'email-error' : undefined}
              aria-invalid={!!errors.email}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.email
                  ? 'border-danger-500 bg-danger-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
              placeholder="you@example.com"
            />
            {errors.email && (
              <p id="email-error" role="alert" className="mt-1.5 text-xs text-danger-600">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-neutral-700 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password')}
              aria-describedby={errors.password ? 'password-error' : undefined}
              aria-invalid={!!errors.password}
              className={`w-full rounded-lg border px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
                errors.password
                  ? 'border-danger-500 bg-danger-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
              placeholder="••••••••"
            />
            {errors.password && (
              <p id="password-error" role="alert" className="mt-1.5 text-xs text-danger-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="login-submit"
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Signing in…
              </>
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>

      {/* Footer */}
      <p className="mt-6 text-center text-xs text-neutral-400">
        Internal business tool · Singam Bus Services
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

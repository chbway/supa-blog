"use client";

import { sharedLoginConfig } from "@/config/shared";
import { GithubIcon, GoogleIcon, LoadingDots } from "@/icons";
import { getUrl } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import z from "zod";

const getLoginRedirectPath = (pathname?: string | null): string => {
  return (
    getUrl() +
    "/auth/callback" + // Required for PKCE authentication.
    "?redirect=" + // Passed to auth/route/callback to redirect after auth
    (pathname ? pathname : "/dashboard")
  );
};

const FormSchema = z.object({
  email: z
    .string({
      required_error: sharedLoginConfig.emailRequiredError,
    })
    .email(),
  password: z
    .string({
      required_error: "Password is required",
    })
    .min(6, "Password must be at least 6 characters long"),
});

interface LoginSectionProps {
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const LoginSection: React.FC<LoginSectionProps> = ({ setOpen }) => {
  const supabase = createClient();
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  });
  const [signInGoogleClicked, setSignInGoogleClicked] =
    React.useState<boolean>(false);
  const [signInGithubClicked, setSignInGithubClicked] =
    React.useState<boolean>(false);
  const [signInPasswordClicked, setSignInPasswordClicked] =
    React.useState<boolean>(false);
  const [signInError, setSignInError] = React.useState<string | null>(null);
  const router = useRouter();
  const currentPathname = usePathname();
  const redirectTo = getLoginRedirectPath(currentPathname);

  async function signInWithGoogle() {
    setSignInGoogleClicked(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          prompt: "consent",
        },
      },
    });
    router.refresh();
  }

  async function signInWithGitHub() {
    setSignInGithubClicked(true);
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo,
        queryParams: {
          prompt: "consent",
        },
      },
    });
    router.refresh();
  }

  async function signInWithPassword(values: z.infer<typeof FormSchema>) {
    setSignInError(null);
    setSignInPasswordClicked(true);
    try {
      const {
        data: { user, session },
        error,
      } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      if (error) {
        setSignInError(error.message || "login failed");
      } else {
        if (setOpen) setOpen(false);
        // redirect to previous path or dashboard
        router.push(currentPathname ? currentPathname : "/dashboard");
        router.refresh();
      }
    } catch (e: any) {
      setSignInError(e?.message || "login failed");
    } finally {
      setSignInPasswordClicked(false);
    }
  }

  return (
    <>
      <div className="mx-auto w-full justify-center rounded-md border border-black/5 bg-gray-50 align-middle shadow-md">
        <div className="flex flex-col items-center justify-center space-y-3 border-b px-4 py-6 pt-8 text-center">
          <a href="">
            <Image
              src="/images/logo.png"
              alt="Logo"
              className="h-16 w-16 rounded-full"
              width={64}
              height={64}
              priority
            />
          </a>
          <h3 className="font-display text-2xl font-bold">
            {sharedLoginConfig.title}
          </h3>
        </div>

        {/* Email / Password form */}
        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-6 md:px-16">
          <form
            onSubmit={form.handleSubmit((v) => signInWithPassword(v))}
            className="w-full space-y-3"
          >
            <div>
              <label className="mb-1 block text-sm text-gray-600">email</label>
              <input
                type="email"
                {...form.register("email")}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="you@example.com"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {String(form.formState.errors.email.message)}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm text-gray-600">password</label>
              <input
                type="password"
                {...form.register("password")}
                className="w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
                placeholder="at least six chars"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {String(form.formState.errors.password.message)}
                </p>
              )}
            </div>

            {signInError && (
              <p className="text-sm text-red-600">{signInError}</p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={signInPasswordClicked}
                className={`${
                  signInPasswordClicked
                    ? "cursor-not-allowed border-gray-200 bg-gray-100"
                    : "border border-gray-200 bg-white text-black hover:bg-gray-50"
                } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
              >
                {signInPasswordClicked ? (
                  <LoadingDots color="#808080" />
                ) : (
                  <p>login</p>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sign in buttons with Social accounts */}
        <div className="flex flex-col space-y-4 bg-gray-50 px-4 py-8 md:px-16">
          <button
            disabled={signInGoogleClicked}
            className={`${
              signInGoogleClicked
                ? "cursor-not-allowed border-gray-200 bg-gray-100"
                : "border border-gray-200 bg-white text-black hover:bg-gray-50"
            } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
            onClick={() => signInWithGoogle()}
          >
            {signInGoogleClicked ? (
              <LoadingDots color="#808080" />
            ) : (
              <>
                <GoogleIcon className="h-5 w-5" />
                <p>{sharedLoginConfig.google}</p>
              </>
            )}
          </button>

          <button
            disabled={signInGithubClicked}
            className={`${
              signInGithubClicked
                ? "cursor-not-allowed border-gray-200 bg-gray-100"
                : "border border-gray-200 bg-white text-black hover:bg-gray-50"
            } flex h-10 w-full items-center justify-center space-x-3 rounded-md border text-sm shadow-sm transition-all duration-75 focus:outline-none`}
            onClick={() => signInWithGitHub()}
          >
            {signInGithubClicked ? (
              <LoadingDots color="#808080" />
            ) : (
              <>
                <GithubIcon className="h-5 w-5" />
                <p>{sharedLoginConfig.github}</p>
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default LoginSection;

import { useState } from "react";

import { loginTeacher, registerTeacher } from "../../api/authApi";

export default function AuthPage({ onAuthSuccess, onSkipAuth }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("Iryna");
  const [email, setEmail] = useState("iryna@test.com");
  const [password, setPassword] = useState("123456");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";

  async function handleSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const authData = isRegisterMode
        ? await registerTeacher({ name, email, password })
        : await loginTeacher({ email, password });

      onAuthSuccess(authData.user);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <section className="grid w-full gap-8 rounded-[2rem] bg-white p-8 shadow-sm md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div className="flex flex-col justify-between">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Teacher workspace
              </div>

              <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
                QuickCards
              </h1>

              <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
                Create card sets, save them to your workspace, and share public
                practice links with students.
              </p>
            </div>

            <div className="mt-10 rounded-3xl bg-slate-50 p-6">
              <h2 className="text-xl font-bold">MVP v1</h2>
              <p className="mt-3 text-slate-600">
                Teacher login, dashboard, saved card sets, public student links,
                and PostgreSQL storage.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-[560px] flex-col rounded-[2rem] bg-slate-50 p-6 shadow-inner"
          >
            <div className="mb-6 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMessage("");
                }}
                className={`rounded-3xl px-6 py-3 font-bold ${
                  mode === "login"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-indigo-600"
                }`}
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setErrorMessage("");
                }}
                className={`rounded-3xl px-6 py-3 font-bold ${
                  mode === "register"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "bg-white text-indigo-600"
                }`}
              >
                Register
              </button>
            </div>

            <h2 className="text-2xl font-bold">
              {isRegisterMode ? "Create teacher account" : "Welcome back"}
            </h2>

            <p className="mt-2 text-slate-600">
              {isRegisterMode
                ? "Register to save and manage your card sets."
                : "Login to open your teacher dashboard."}
            </p>

            {isRegisterMode && (
              <label className="mt-6 block">
                <span className="mb-2 block text-sm font-bold text-slate-600">
                  Name
                </span>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold outline-none transition focus:border-indigo-300"
                  placeholder="Your name"
                />
              </label>
            )}

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-600">
                Email
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold outline-none transition focus:border-indigo-300"
                placeholder="teacher@email.com"
              />
            </label>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-bold text-slate-600">
                Password
              </span>
              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold outline-none transition focus:border-indigo-300"
                placeholder="Minimum 6 characters"
              />
            </label>

            {errorMessage && (
              <div className="mt-5 rounded-2xl bg-red-50 px-5 py-4 font-semibold text-red-600">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-auto w-full rounded-3xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting
                ? "Please wait..."
                : isRegisterMode
                  ? "Create account"
                  : "Login"}
            </button>

            <button
              type="button"
              onClick={onSkipAuth}
              className="mt-3 w-full rounded-3xl bg-indigo-50 px-6 py-4 font-bold text-indigo-600 hover:bg-indigo-100"
            >
              Continue in dev mode
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}

import { useState } from "react";

import { loginTeacher, registerTeacher } from "../../api/authApi";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("Iryna");
  const [email, setEmail] = useState("iryna@test.com");
  const [password, setPassword] = useState("123456");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegisterMode = mode === "register";

  function flipCard() {
    setMode((currentMode) => (currentMode === "login" ? "register" : "login"));
    setErrorMessage("");
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const authData = await loginTeacher({ email, password });
      onAuthSuccess(authData.user);
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || "Authentication failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegisterSubmit(event) {
    event.preventDefault();

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const authData = await registerTeacher({ name, email, password });
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
        <div className="w-full [perspective:1600px]">
          <div
            onClick={flipCard}
            className={`relative min-h-[600px] w-full cursor-pointer transition-transform duration-700 [transform-style:preserve-3d] ${
              isRegisterMode ? "[transform:rotateY(180deg)]" : ""
            }`}
          >
            <section className="absolute inset-0 grid rounded-[2rem] bg-white p-8 shadow-sm [backface-visibility:hidden] md:grid-cols-[1fr_0.9fr] md:p-10">
              <BrandPanel hint="Click the card to create an account" />

              <div className="flex items-center justify-center">
                <form
                  onSubmit={handleLoginSubmit}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full max-w-md rounded-[2rem] bg-slate-50 p-6 shadow-inner"
                >
                  <h2 className="text-2xl font-bold">Login</h2>

                  <p className="mt-2 text-slate-600">
                    Open your teacher dashboard and continue working with saved
                    card sets.
                  </p>

                  <label className="mt-7 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Email
                    </span>

                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold outline-none transition focus:border-indigo-300"
                      placeholder="teacher@email.com"
                    />
                  </label>

                  <label className="mt-4 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Password
                    </span>

                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      type="password"
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-4 font-semibold outline-none transition focus:border-indigo-300"
                      placeholder="Minimum 6 characters"
                    />
                  </label>

                  <div className="min-h-[48px]">
                    {errorMessage && mode === "login" && (
                      <div className="mt-4 rounded-2xl bg-red-50 px-5 py-3 font-semibold text-red-600">
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 w-full rounded-3xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && mode === "login"
                      ? "Please wait..."
                      : "Login"}
                  </button>
                </form>
              </div>
            </section>

            <section className="absolute inset-0 grid rounded-[2rem] bg-white p-8 shadow-sm [backface-visibility:hidden] [transform:rotateY(180deg)] md:grid-cols-[1fr_0.9fr] md:p-10">
              <BrandPanel hint="Click the card to login" />

              <div className="flex items-center justify-center">
                <form
                  onSubmit={handleRegisterSubmit}
                  onClick={(event) => event.stopPropagation()}
                  className="w-full max-w-md rounded-[2rem] bg-slate-50 p-5 shadow-inner"
                >
                  <h2 className="text-2xl font-bold">Register</h2>

                  <p className="mt-2 text-slate-600">
                    Create your teacher account to save and manage card sets.
                  </p>

                  <label className="mt-5 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Name
                    </span>

                    <input
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      required
                      autoComplete="name"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-3.5 font-semibold outline-none transition focus:border-indigo-300"
                      placeholder="Your name"
                    />
                  </label>

                  <label className="mt-3.5 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Email
                    </span>

                    <input
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                      type="email"
                      autoComplete="email"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-3.5 font-semibold outline-none transition focus:border-indigo-300"
                      placeholder="teacher@email.com"
                    />
                  </label>

                  <label className="mt-3.5 block">
                    <span className="mb-2 block text-sm font-bold text-slate-600">
                      Password
                    </span>

                    <input
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      minLength={6}
                      type="password"
                      autoComplete="new-password"
                      className="w-full rounded-2xl border border-transparent bg-white px-5 py-3.5 font-semibold outline-none transition focus:border-indigo-300"
                      placeholder="Minimum 6 characters"
                    />
                  </label>

                  <div className="min-h-[40px]">
                    {errorMessage && mode === "register" && (
                      <div className="mt-3 rounded-2xl bg-red-50 px-5 py-2.5 font-semibold text-red-600">
                        {errorMessage}
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-1 w-full rounded-3xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-sm hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting && mode === "register"
                      ? "Please wait..."
                      : "Create account"}
                  </button>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}

function BrandPanel({ hint }) {
  return (
    <div className="flex flex-col justify-center">
      <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-500 shadow-sm">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Teacher workspace
      </div>

      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        QuickCards
      </h1>

      <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
        Create card sets, save them to your workspace, and share public practice
        links with students.
      </p>

      <div className="mt-8 inline-flex w-fit items-center gap-2 rounded-full bg-indigo-50 px-5 py-3 text-sm font-bold text-indigo-600">
        <span className="text-lg">↻</span>
        {hint}
      </div>
    </div>
  );
}

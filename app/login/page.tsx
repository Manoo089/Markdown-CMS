import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-r from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Sign in to MDCMS</h2>
          <p className="mt-2 text-gray-600">
            Markdown Content Management System <br /> by <b>Hohenadl Development</b>
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

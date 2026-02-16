import LoginForm from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">HRシステム</h1>
          <p className="auth-description">
            アカウントにログインしてください
          </p>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}

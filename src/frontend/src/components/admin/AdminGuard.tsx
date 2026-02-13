interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  // Passthrough wrapper - no authentication or authorization checks
  return <>{children}</>;
}

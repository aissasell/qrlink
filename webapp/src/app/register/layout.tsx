import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Register',
  description: 'Create an account on QRLink to start managing and shortening your links.',
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

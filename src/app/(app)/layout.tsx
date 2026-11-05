import { AppShell } from '@/components/shell';

/**
 * Every screen in the information architecture renders inside the shell. The
 * style guide included: it is a route in the product, reachable from the
 * sidebar like any other.
 */
export default function AppLayout({ children }: LayoutProps<'/'>) {
  return <AppShell>{children}</AppShell>;
}

// components/ui/Logo.tsx
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

/**
 * Renders the CrickLive logo icon.
 * Default size is h-10 w-10.
 * You can override this using the `className` prop.
 * e.g., <Logo className="h-8 w-8" />
 */
export const Logo = ({ className }: LogoProps) => {
  return (
    <Image
      src="/images/Logo.png" // This points to public/logo-icon.svg
      alt="CrickLive Logo"
      width={40}
      height={40}
      className={cn("h-10 w-10", className)} // Default size, overridable
    />
  );
};
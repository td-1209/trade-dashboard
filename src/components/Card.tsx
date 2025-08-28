import Link from 'next/link';

interface CardProps {
  children: React.ReactNode;
  padding?: 'default' | 'large';
  href?: string;
}

export const Card = ({ children, padding = 'default', href }: CardProps) => {
  const paddingClass = padding === 'large' ? 'p-3' : 'p-5';

  const cardElement = (
    <div className={`bg-darkGray rounded-lg ${paddingClass} w-full h-full`}>
      {children}
    </div>
  );

  if (href) {
    return <Link href={href}>{cardElement}</Link>;
  }

  return cardElement;
};

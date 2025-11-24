interface Props {
  children: React.ReactNode;
}

export default function Navigation({ children }: Props) {
  return (
    <nav className="bg-surface shadow-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">{children}</div>
      </div>
    </nav>
  );
}

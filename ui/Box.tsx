interface Props {
  children: React.ReactNode;
}

export function Box({ children }: Props) {
  return (
    <div className="bg-surface rounded-lg shadow py-6 px-10 space-y-6">
      {children}
    </div>
  );
}

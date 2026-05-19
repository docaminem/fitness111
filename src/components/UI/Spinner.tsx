
interface Props {
  size?: 'sm' | 'md' | 'lg';
}

export default function Spinner({ size = 'md' }: Props) {
  const sizeMap = { sm: 'w-6 h-6', md: 'w-10 h-10', lg: 'w-16 h-16' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeMap[size]} border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin`} />
    </div>
  );
}

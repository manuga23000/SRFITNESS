interface Props {
  size?: 'sm' | 'lg'
}

export function Logo({ size = 'sm' }: Props) {
  const grande = size === 'lg'
  return (
    <div className="flex items-center gap-2.5 select-none">
      <div
        className={`grid shrink-0 place-items-center rounded-xl bg-lime-neon font-display text-ink-950 shadow-[0_0_24px_-4px] shadow-lime-neon/60 ${
          grande ? 'h-16 w-16 text-4xl' : 'h-9 w-9 text-xl'
        }`}
      >
        SR
      </div>
      <div className="leading-none">
        <div className={`font-display tracking-wide text-white ${grande ? 'text-5xl' : 'text-2xl'}`}>SR FITNESS</div>
        <div className={`font-display tracking-[0.35em] text-lime-neon ${grande ? 'text-xl' : 'text-[0.8rem]'}`}>
          GYM
        </div>
      </div>
    </div>
  )
}

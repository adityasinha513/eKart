interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export default function SectionHeading({ title, subtitle, action }: SectionHeadingProps) {
  return (
    <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div>
        <h2 className="text-2xl font-semibold text-maroon-900 sm:text-3xl">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm text-stone-500 sm:text-base">{subtitle}</p> : null}
      </div>
      {action ? <div>{action}</div> : null}
    </div>
  );
}

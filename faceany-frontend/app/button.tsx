import { ReactNode } from "react";

export default function Button({
  onClick,
  children,
}: {
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 justify-center p-5">
      <button className="px-3 rounded-full bg-slate-700" onClick={onClick}>
        {children}
      </button>
    </div>
  );
}

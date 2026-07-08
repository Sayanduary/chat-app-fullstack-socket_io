const BorderAnimatedContainer = ({ children }) => {
  return (
    <div
      className="
        relative flex h-full w-full overflow-hidden rounded-2xl border border-transparent
        bg-[linear-gradient(135deg,#000000,#09090b_50%,#000000)_padding-box,conic-gradient(from_var(--border-angle),transparent_78%,rgb(34_211_238/.35)_84%,rgb(103_232_249)_88%,rgb(34_211_238/.35)_92%,transparent_98%)_border-box]
        animate-border
      "
    >
      {children}
    </div>
  );
};

export default BorderAnimatedContainer;

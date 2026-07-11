function BorderAnimatedContainer({ children }) {
  return (
    <div className="flex h-full w-full overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(145deg,rgba(7,9,14,0.96),rgba(13,17,24,0.92))] shadow-[0_28px_120px_rgba(0,0,0,0.7)]">
      {children}
    </div>
  );
}
export default BorderAnimatedContainer;

const MessagesLoadingSkeleton = () => {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-6 py-8 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => {
        const isRight = index % 2 === 0;

        return (
          <div
            key={index}
            className={`flex ${isRight ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-end gap-3">
              {!isRight && (
                <div className="h-10 w-10 rounded-full bg-slate-800" />
              )}

              <div className="space-y-2">
                <div
                  className={`h-4 rounded bg-slate-800 ${
                    isRight ? "w-32" : "w-48"
                  }`}
                />

                <div
                  className={`rounded-2xl bg-slate-800 ${
                    isRight
                      ? "h-16 w-56 rounded-br-md"
                      : "h-20 w-64 rounded-bl-md"
                  }`}
                />

                <div className="h-3 w-16 rounded bg-slate-800" />
              </div>

              {isRight && (
                <div className="h-10 w-10 rounded-full bg-slate-800" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesLoadingSkeleton;

const MessagesLoadingSkeleton = () => {
  return (
    <div className="mx-auto flex max-w-3xl animate-pulse flex-col gap-6 px-6 py-8">
      {Array.from({ length: 8 }).map((_, index) => {
        const isRight = index % 2 === 0;

        return (
          <div
            key={index}
            className={`flex ${isRight ? "justify-end" : "justify-start"}`}
          >
            <div className="flex items-end gap-3">
              {!isRight && (
                <div className="h-10 w-10 rounded-full bg-white/10" />
              )}

              <div className="space-y-2">
                <div
                  className={`h-4 rounded bg-white/10 ${
                    isRight ? "w-32" : "w-48"
                  }`}
                />

                <div
                  className={`rounded-2xl bg-white/10 ${
                    isRight
                      ? "h-16 w-56 rounded-br-md"
                      : "h-20 w-64 rounded-bl-md"
                  }`}
                />

                <div className="h-3 w-16 rounded bg-white/10" />
              </div>

              {isRight && (
                <div className="h-10 w-10 rounded-full bg-white/10" />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessagesLoadingSkeleton;

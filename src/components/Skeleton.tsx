export function Skeleton({ className }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded-xl ${className}`} />
    );
}

export function TableSkeleton() {
    return (
        <div className="space-y-4 w-full mt-4 animate-in fade-in duration-500">
            <div className="flex gap-4 border-b border-gray-100 pb-4 hidden md:flex">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex gap-4 py-6 border-b border-gray-50 items-center">
                    <div className="flex gap-3 items-center w-full md:w-1/4 border-b md:border-b-0 pb-4 md:pb-0">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-1/4 hidden md:block" />
                    <Skeleton className="h-4 w-1/4 hidden md:block" />
                    <Skeleton className="h-10 w-32 rounded-xl shrink-0 hidden md:block" />
                </div>
            ))}
        </div>
    );
}

export function CardSkeleton() {
    return (
        <div className="space-y-4 w-full animate-in fade-in duration-500">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100 flex flex-col gap-4">
                    <div className="flex gap-3 items-center">
                        <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    </div>
                    <Skeleton className="h-4 w-full" />
                    <div className="flex justify-end gap-2 pt-4">
                        <Skeleton className="h-10 w-10 rounded-xl" />
                        <Skeleton className="h-10 w-10 rounded-xl" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export function WaitlistSkeleton() {
    return (
        <div className="space-y-4 animate-in fade-in duration-500">
            {[1, 2, 3].map(i => (
                <div key={i} className="p-6 rounded-[2rem] bg-gray-50 flex flex-col md:flex-row gap-6">
                    <div className="flex gap-4 items-center md:w-1/3">
                        <Skeleton className="h-12 w-12 rounded-2xl shrink-0" />
                        <div className="space-y-2 w-full">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-1/3 mt-2" />
                    </div>
                    <div className="flex gap-3 items-center">
                        <Skeleton className="h-10 w-32 rounded-xl" />
                        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
                    </div>
                </div>
            ))}
        </div>
    )
}

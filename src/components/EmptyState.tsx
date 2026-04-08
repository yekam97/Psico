import { Info } from "lucide-react";

export function EmptyState({ title, description, icon: Icon = Info }: { title: string, description: string, icon?: any }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200 animate-in fade-in zoom-in duration-500">
            <div className="w-24 h-24 bg-primary/5 rounded-[2rem] flex items-center justify-center text-primary/40 mb-6 group hover:scale-105 transition-transform">
                <Icon size={48} strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-3">{title}</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto leading-relaxed">{description}</p>
        </div>
    );
}

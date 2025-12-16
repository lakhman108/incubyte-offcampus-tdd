
import type { Sweet } from '../types';
import { Button } from './ui/button';

interface SweetCardProps {
    sweet: Sweet;
    onPurchase: (id: string, quantity: number) => void;
    onEdit?: (sweet: Sweet) => void;
    purchaseQuantity: number;
    setPurchaseQuantity: (qty: number) => void;
}

export default function SweetCard({
    sweet,
    onPurchase,
    onEdit,
    purchaseQuantity,
    setPurchaseQuantity,
}: SweetCardProps) {

    // Generate a deterministic gradient based on the sweet name
    const getGradient = (name: string) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const hues = [
            'from-pink-500 to-rose-500',
            'from-purple-500 to-indigo-500',
            'from-cyan-500 to-blue-500',
            'from-emerald-500 to-teal-500',
            'from-amber-500 to-orange-500'
        ];
        return hues[hash % hues.length];
    };

    const gradientClass = getGradient(sweet.name);
    const isOutOfStock = sweet.quantity === 0;

    return (
        <div className="group relative h-full">
            <div className={`
        relative h-full overflow-hidden rounded-3xl bg-card border border-white/5 shadow-lg 
        transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-2
        ${isOutOfStock ? 'opacity-80 grayscale-[0.5]' : ''}
      `}>
                {/* Abstract Image Placeholder */}
                <div className={`h-48 w-full bg-gradient-to-br ${gradientClass} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="absolute -bottom-12 -right-12 text-[10rem] opacity-20 transform rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-6 select-none">
                        🍬
                    </div>
                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            {sweet.category}
                        </span>
                    </div>
                    {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                            <span className="text-2xl font-black text-white uppercase border-4 border-white px-6 py-2 transform -rotate-12">
                                Sold Out
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                            {sweet.name}
                        </h3>
                        <div className="flex flex-col items-end">
                            <span className="text-2xl font-black text-primary drop-shadow-sm">
                                ${sweet.price.toFixed(2)}
                            </span>
                            <span className={`text-xs ${sweet.quantity < 10 && sweet.quantity > 0 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                                {sweet.quantity} in stock
                            </span>
                        </div>
                    </div>

                    {/* Action Area */}
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                        <div className="flex gap-3">
                            <input
                                type="number"
                                min="1"
                                max={sweet.quantity}
                                value={purchaseQuantity}
                                onChange={(e) => setPurchaseQuantity(parseInt(e.target.value) || 1)}
                                className="w-16 bg-white/5 border border-white/10 rounded-lg text-center font-mono py-2 focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                disabled={isOutOfStock}
                            />
                            <Button
                                className={`flex-1 font-bold tracking-wide transition-all duration-300 ${isOutOfStock ? 'cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                                onClick={() => onPurchase(sweet._id, purchaseQuantity)}
                                disabled={isOutOfStock}
                                variant={isOutOfStock ? "secondary" : "default"}
                            >
                                {isOutOfStock ? 'Unavailable' : 'Add to Cart'}
                            </Button>
                        </div>

                        {onEdit && (
                            <Button
                                onClick={() => onEdit(sweet)}
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs text-muted-foreground hover:text-white hover:bg-white/5"
                            >
                                Edit Details
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from "react";
import { Tag, X } from "lucide-react";

const categories = [
	{ name: "Cars" },
	{ name: "Electronics" },
	{ name: "Fashion" },
	{ name: "Home" },
	{ name: "Sports" },
	{ name: "Accessories" },
];

const filters = {
	price: [0, Infinity],
	categories: [],
	location: "",
};

export default function FilterBar({
	onFilter,
}: {
	onFilter: (filters: any) => void;
}) {
	const [selected, setSelected] = useState<string[]>([]);
	const [price, setPrice] = useState([0, 100000]);

	function toggleCategory(cat: string) {
		setSelected((sel) => {
			const next = sel.includes(cat)
				? sel.filter((c) => c !== cat)
				: [...sel, cat];
			onFilter({ categories: next, price });
			return next;
		});
	}

	function handlePriceChange(
		e: React.ChangeEvent<HTMLInputElement>,
		idx: number
	) {
		const val = Number(e.target.value);
		setPrice((p) => {
			const next = [...p] as number[];
			next[idx] = val;
			onFilter({ categories: selected, price: next });
			return next;
		});
	}

	return (
		<div className="backdrop-blur-xl bg-gradient-to-r from-[#232325]/60 via-[#1a1a2e]/80 to-[#232325]/60 rounded-2xl shadow-2xl p-6 flex flex-col md:flex-row gap-6 items-center justify-between border border-accent/30 mb-8 animate-fade-in">
			<div className="flex flex-wrap gap-3 items-center">
				{categories.map((cat) => (
					<button
						key={cat.name}
						className={`px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 transition-all border-2 shadow-lg focus:outline-none focus:ring-2 focus:ring-accent/60 ${
							selected.includes(cat.name)
								? "bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 text-white border-accent/80 shadow-neon"
								: "bg-white/10 dark:bg-[#232325]/40 border-accent/30 text-accent-200 hover:bg-accent/10 hover:border-accent/60"
						}`}
						onClick={() => toggleCategory(cat.name)}
					>
						<Tag className="w-4 h-4" /> {cat.name}
						{selected.includes(cat.name) && (
							<X className="w-3 h-3 ml-1" />
						)}
					</button>
				))}
			</div>
			<div className="flex items-center gap-3">
				<span className="text-xs text-accent-200 font-semibold">Price:</span>
				<input
					type="range"
					min={0}
					max={100000}
					value={price[0]}
					onChange={(e) => handlePriceChange(e, 0)}
					className="accent-accent w-28 rounded-lg border-2 border-accent/30 bg-[#181a2a] shadow-neon transition-all focus:ring-2 focus:ring-accent/60"
				/>
				<span className="text-xs font-bold text-accent-200">{price[0]}</span>
				<span className="mx-1 text-xs text-accent-200">-</span>
				<input
					type="range"
					min={0}
					max={100000}
					value={price[1]}
					onChange={(e) => handlePriceChange(e, 1)}
					className="accent-accent w-28 rounded-lg border-2 border-accent/30 bg-[#181a2a] shadow-neon transition-all focus:ring-2 focus:ring-accent/60"
				/>
				<span className="text-xs font-bold text-accent-200">{price[1]}</span>
			</div>
			<div className="flex flex-wrap gap-4">
				<input
					type="text"
					placeholder="Location"
					className="rounded-lg border-2 border-accent/30 bg-[#181a2a] text-accent-200 px-4 py-2 focus:border-accent/60 focus:ring-2 focus:ring-accent/60 transition-all shadow-neon"
					onChange={(e) => onFilter({ location: e.target.value })}
				/>
			</div>
		</div>
	);
}

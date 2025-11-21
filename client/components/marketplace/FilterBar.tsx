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
		<div className="backdrop-blur bg-white/40 dark:bg-[#232325]/60 rounded-2xl shadow-xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between border border-white/20 dark:border-gray-800 mb-6">
			<div className="flex flex-wrap gap-2 items-center">
				{categories.map((cat) => (
					<button
						key={cat.name}
						className={`px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 transition-all border-2 ${
							selected.includes(cat.name)
								? "bg-gradient-to-r from-primary/60 to-accent/60 text-white border-primary shadow-lg"
								: "bg-white/60 dark:bg-[#232325]/60 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-primary/10 hover:border-primary/40"
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
			<div className="flex items-center gap-2">
				<span className="text-xs text-gray-500">Price:</span>
				<input
					type="range"
					min={0}
					max={100000}
					value={price[0]}
					onChange={(e) => handlePriceChange(e, 0)}
					className="accent-primary w-24"
				/>
				<span className="text-xs font-bold text-primary">{price[0]}</span>
				<span className="mx-1 text-xs text-gray-400">-</span>
				<input
					type="range"
					min={0}
					max={100000}
					value={price[1]}
					onChange={(e) => handlePriceChange(e, 1)}
					className="accent-primary w-24"
				/>
				<span className="text-xs font-bold text-primary">{price[1]}</span>
			</div>
			{/* Added advanced filters for categories, price range, and location */}
			<div className="flex flex-wrap gap-4">
				<select
					className="border rounded-lg p-2"
					onChange={(e) => onFilter({ categories: [e.target.value] })}
				>
					<option value="">All Categories</option>
					{categories.map((category) => (
						<option key={category.name} value={category.name}>
							{category.name}
						</option>
					))}
				</select>
				<input
					type="number"
					placeholder="Min Price"
					className="border rounded-lg p-2"
					onChange={(e) =>
						onFilter({
							price: [
								parseInt(e.target.value),
								filters.price?.[1] || Infinity,
							],
						})
					}
				/>
				<input
					type="number"
					placeholder="Max Price"
					className="border rounded-lg p-2"
					onChange={(e) =>
						onFilter({
							price: [
								filters.price?.[0] || 0,
								parseInt(e.target.value),
							],
						})
					}
				/>
				<input
					type="text"
					placeholder="Location"
					className="border rounded-lg p-2"
					onChange={(e) => onFilter({ location: e.target.value })}
				/>
			</div>
		</div>
	);
}

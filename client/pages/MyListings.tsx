
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash, Edit, Eye, Heart, Phone } from "lucide-react";

const MyListings: React.FC = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchListings() {
      setLoading(true);
      try {
        const response = await fetch("/api/marketplace/mine");
        const data = await response.json();
        setListings(data);
      } catch (error) {
        console.error("Failed to fetch listings", error);
      } finally {
        setLoading(false);
      }
    }

    fetchListings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this listing?")) return;

    try {
      const response = await fetch(`/api/marketplace/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setListings((prev) => prev.filter((listing) => listing.id !== id));
      } else {
        console.error("Failed to delete listing");
      }
    } catch (error) {
      console.error("Error deleting listing", error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Listings</h1>
      {loading ? (
        <p>Loading...</p>
      ) : listings.length === 0 ? (
        <p>You have no listings.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="relative group rounded-3xl p-0.5 bg-gradient-to-br from-white/60 via-primary/10 to-accent/10 dark:from-[#232325]/60 dark:via-[#232325]/80 dark:to-[#1a1a2e]/80 shadow-2xl hover:shadow-primary/30 transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex flex-col"
              style={{ minHeight: 340 }}
            >
              <div className="relative bg-white/80 dark:bg-[#232325]/80 rounded-3xl overflow-hidden flex flex-col h-full backdrop-blur-xl">
                <div className="relative w-full h-40 overflow-hidden">
                  <img
                    src={listing.images?.[0] || "/placeholder.jpg"}
                    alt={listing.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                </div>
                <div className="flex-1 flex flex-col p-4">
                  <div className="font-bold text-lg mb-1 line-clamp-2">{listing.title}</div>
                  <div className="mb-1 text-xl font-bold text-accent-400">{listing.price} DZD</div>
                  <div className="mb-1 text-xs text-primary-400 font-medium flex gap-2 items-center">
                    {listing.category}
                  </div>
                  <div className="flex gap-4 text-xs text-gray-500 mt-2">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" />{listing.views || 0} views</span>
                    <span className="flex items-center gap-1"><Heart className="w-4 h-4" />{listing.saves || listing.favorites || 0} saves</span>
                    <span className="flex items-center gap-1"><Phone className="w-4 h-4" />{listing.contacts || 0} contacts</span>
                  </div>
                  <div className="flex justify-between mt-auto pt-4">
                    <Link to={`/edit-listing/${listing.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4 mr-1" /> Edit
                      </Button>
                    </Link>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(listing.id)}
                    >
                      <Trash className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
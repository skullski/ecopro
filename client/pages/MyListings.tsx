import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Trash, Edit } from "lucide-react";

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="border rounded-lg p-4 shadow-md flex flex-col"
            >
              <img
                src={listing.images?.[0] || "/placeholder.jpg"}
                alt={listing.title}
                className="w-full h-40 object-cover rounded-md mb-2"
              />
              <h2 className="text-lg font-bold mb-1">{listing.title}</h2>
              <p className="text-sm text-gray-600 mb-2">{listing.description}</p>
              <p className="text-sm font-medium text-primary mb-2">
                {listing.price} DZD
              </p>
              <div className="flex justify-between mt-auto">
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
          ))}
        </div>
      )}
    </div>
  );
};

export default MyListings;
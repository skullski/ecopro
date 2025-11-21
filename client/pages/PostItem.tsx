import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const PostItem: React.FC = () => {
  const navigate = useNavigate();

  const categories = [
    "Electronics",
    "Fashion",
    "Home",
    "Books",
    "Toys",
    "Other",
  ];
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: categories[0],
    location: "",
    image: null as File | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, image: e.target.files[0] });
    }
  };

  const validate = () => {
    if (!formData.title.trim()) return "Title is required.";
    if (!formData.description.trim()) return "Description is required.";
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) return "Valid price is required.";
    if (!formData.category) return "Category is required.";
    if (!formData.location.trim()) return "Location is required.";
    if (!formData.image) return "Image is required.";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "image" && value) {
          formDataToSend.append(key, value as File);
        } else if (key !== "image") {
          formDataToSend.append(key, value as string);
        }
      });
      const response = await fetch("/api/marketplace/items", {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
      });
      if (response.ok) {
        navigate("/my-listings");
      } else {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Failed to post item");
      }
    } catch (err: any) {
      setError(err.message || "Error posting item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Post a New Item</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Image</label>
          <input
            type="file"
            name="image"
            onChange={handleFileChange}
            className="w-full border rounded p-2"
            required
          />
        </div>
        {error && <div className="text-red-600 font-bold text-center mb-2">{error}</div>}
        <Button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded w-full" disabled={loading}>
          {loading ? "Posting..." : "Post Item"}
        </Button>
      </form>
    </div>
  );
};

export default PostItem;
import { RequestHandler } from "express";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: "postgresql://eco_db_drrv_user:teCMT25hytwYFgWqpmg2Q0x97TJymRhs@dpg-d4cl4ubipnbc739hbcmg-a.oregon-postgres.render.com/eco_db_drrv",
});

// Handler to delete a store image
export const deleteStoreImage: RequestHandler = async (req, res) => {
  const { storeId, imageIndex } = req.body;

  if (typeof storeId !== "string" || typeof imageIndex !== "number") {
    return res.status(400).json({ error: "Invalid request payload" });
  }

  try {
    const client = await pool.connect();

    // Fetch the current store images
    const result = await client.query(
      "SELECT store_images FROM stores WHERE id = $1",
      [storeId]
    );

    if (result.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: "Store not found" });
    }

    const images: string[] = result.rows[0].store_images || [];
    if (imageIndex < 0 || imageIndex >= images.length) {
      client.release();
      return res.status(400).json({ error: "Invalid image index" });
    }

    // Remove the image from the array
    images.splice(imageIndex, 1);

    // Update the store images in the database
    await client.query(
      "UPDATE stores SET store_images = $1 WHERE id = $2",
      [images, storeId]
    );

    client.release();
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error deleting store image:", error);
    res.status(500).json({ error: "Failed to delete store image" });
  }
};
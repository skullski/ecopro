import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, RefreshCw, Database } from "lucide-react";
import type { Vendor, Product } from "@shared/types";

export default function DataMigration() {
  const [migrationStatus, setMigrationStatus] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  function runMigration() {
    setIsRunning(true);
    setMigrationStatus([]);
    const log = (msg: string) => setMigrationStatus(prev => [...prev, msg]);

    try {
      // Migrate vendors
      const vendors = JSON.parse(localStorage.getItem("vendors") || "[]");
      let vendorsMigrated = 0;

      const updatedVendors = vendors.map((v: Vendor) => {
        let updated = { ...v };
        let changed = false;

        if (!v.storeSlug) {
          const storeSlug = v.businessName
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim() + `-${v.id.split('_')[1] || Date.now()}`;
          updated.storeSlug = storeSlug;
          changed = true;
        }

        // No VIP fields required anymore; ensure storeSlug exists.

        if (changed) vendorsMigrated++;
        return updated;
      });

      if (vendorsMigrated > 0) {
        localStorage.setItem("vendors", JSON.stringify(updatedVendors));
        log(`✅ Migrated ${vendorsMigrated} vendors with missing fields`);
      } else {
        log(`✅ All vendors up to date (${vendors.length} vendors)`);
      }

      // Migrate products
      const products = JSON.parse(localStorage.getItem("marketplaceProducts") || "[]");
      let productsMigrated = 0;

      const updatedProducts = products.map((p: Product) => {
        // Normalize: ensure published flag exists
        if (p.published === undefined) {
          productsMigrated++;
          return { ...p, published: true };
        }
        return p;
      });

      if (productsMigrated > 0) {
        localStorage.setItem("marketplaceProducts", JSON.stringify(updatedProducts));
        log(`✅ Migrated ${productsMigrated} products - now visible in marketplace`);
      } else {
        log(`✅ All products up to date (${products.length} products)`);
      }

      log(`🎉 Migration completed successfully!`);
    } catch (error) {
      log(`❌ Error: ${error.message}`);
    }

    setIsRunning(false);
  }

  return (
    <section className="min-h-screen bg-background py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Database className="h-8 w-8 text-primary" />
              <div>
              <h1 className="text-3xl font-bold">Data Migration Tool</h1>
              <p className="text-muted-foreground">Normalize existing vendor & product data (no premium fields required)</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold mb-1">This tool will:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Add <code>storeSlug</code> to vendors without one</li>
                  <li>Ensure product export flag <code>isExportedToMarketplace</code> is present</li>
                  <li>Make older products visible in the main marketplace when requested</li>
                </ul>
              </div>
            </div>
          </div>

          <Button 
            onClick={runMigration} 
            disabled={isRunning}
            size="lg"
            className="w-full mb-6"
          >
            {isRunning ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Running Migration...
              </>
            ) : (
              <>
                <Database className="h-5 w-5 mr-2" />
                Run Migration
              </>
            )}
          </Button>

          {migrationStatus.length > 0 && (
            <Card className="p-4 bg-muted">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                Migration Log
              </h3>
              <div className="space-y-2 font-mono text-sm">
                {migrationStatus.map((msg, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    {msg}
                  </div>
                ))}
              </div>
            </Card>
          )}

          <div className="mt-6 p-4 border-2 border-dashed border-border rounded-lg">
            <h3 className="font-bold mb-2">Current Status</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Badge variant="outline" className="mb-2">Vendors</Badge>
                <p className="text-muted-foreground">
                  {JSON.parse(localStorage.getItem("vendors") || "[]").length} total
                </p>
              </div>
              <div>
                <Badge variant="outline" className="mb-2">Products</Badge>
                <p className="text-muted-foreground">
                  {JSON.parse(localStorage.getItem("marketplaceProducts") || "[]").length} total
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}

import { redirect } from "next/navigation";
import { eq, desc, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { properties, propertyImages } from "@/lib/db/schema";
import { getBasePath, joinPath } from "@/lib/tenant";
import { getSessionUser } from "@/lib/auth";
import PropertiesManager from "@/components/dashboard/PropertiesManager";

export default async function DashboardPropertiesPage() {
  const basePath = await getBasePath();
  const user = await getSessionUser();
  if (!user) redirect(joinPath(basePath, "/dashboard/login"));

  const rows = await db
    .select()
    .from(properties)
    .where(eq(properties.clientId, user.clientId))
    .orderBy(desc(properties.isFeatured), asc(properties.sortOrder));

  const images = await Promise.all(
    rows.map((row) =>
      db
        .select()
        .from(propertyImages)
        .where(eq(propertyImages.propertyId, row.id))
        .orderBy(desc(propertyImages.isPrimary), asc(propertyImages.sortOrder)),
    ),
  );

  return (
    <div className="mx-auto max-w-5xl">
      <div>
        <h1 className="display-md">Properties</h1>
        <p className="mt-1.5 text-[13px] text-ink-muted">
          Listings shown here are visible on the public site as soon as they are published. A
          listing without a RERA registration number shows a visible &ldquo;Registration
          pending&rdquo; state rather than hiding it.
        </p>
      </div>

      <PropertiesManager
        properties={rows.map((row, i) => ({
          id: row.id,
          title: row.title,
          slug: row.slug,
          propertyType: row.propertyType,
          purpose: row.purpose,
          status: row.status,
          price: row.price?.toString() ?? "",
          priceLabel: row.priceLabel ?? "",
          pricePerSqft: row.pricePerSqft?.toString() ?? "",
          sector: row.sector ?? "",
          locality: row.locality ?? "",
          corridor: row.corridor ?? "",
          beds: row.beds?.toString() ?? "",
          baths: row.baths?.toString() ?? "",
          area: row.area?.toString() ?? "",
          areaUnit: row.areaUnit ?? "sqft",
          badge: row.badge ?? "",
          developer: row.developer ?? "",
          reraNumber: row.reraNumber ?? "",
          description: row.description ?? "",
          amenities: row.amenities ?? [],
          isFeatured: row.isFeatured,
          isActive: row.isActive,
          images: images[i].map((img) => ({
            id: img.id,
            path: img.path,
            alt: img.alt,
            isPrimary: img.isPrimary,
          })),
        }))}
      />
    </div>
  );
}

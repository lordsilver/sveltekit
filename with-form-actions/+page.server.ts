import { error } from '@sveltejs/kit';
import { db } from '$db';
import { listingsTable, cpuModelsTable, suppliersTable } from '$db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { z } from 'zod';
import { createSelectSchema } from 'drizzle-zod';

// Types and Schemas
// -----------------

const ListingSchema = createSelectSchema(listingsTable);
const CpuModelSchema = createSelectSchema(cpuModelsTable);
const SupplierSchema = createSelectSchema(suppliersTable);

const ListingWithDetailsSchema = z.object({
	id: ListingSchema.shape.id,
	name: CpuModelSchema.shape.name,
	price: ListingSchema.shape.price,
	shippingCost: ListingSchema.shape.shippingCost,
	supplier: SupplierSchema.shape.name,
	url: ListingSchema.shape.url
});

type Listing = z.infer<typeof ListingWithDetailsSchema>;

// Database Functions
// ------------------

/**
 * Fetches CPU listings from the database
 * @returns Promise<Listing[]> Array of CPU listings
 */
const getCpuListings = async (): Promise<Listing[]> => {
	const rawListings = await db
		.select({
			id: listingsTable.id,
			name: cpuModelsTable.name,
			price: listingsTable.price,
			shippingCost: listingsTable.shippingCost,
			supplier: suppliersTable.name,
			url: listingsTable.url
		})
		.from(listingsTable)
		.innerJoin(cpuModelsTable, eq(listingsTable.cpuModelId, cpuModelsTable.id))
		.innerJoin(suppliersTable, eq(listingsTable.supplierId, suppliersTable.id))
		.orderBy(listingsTable.price);

	return rawListings.map((listing) => ListingWithDetailsSchema.parse(listing));
};

// Utility Functions
// -----------------

/**
 * Converts cents to euros
 * @param cents Amount in cents
 * @returns number Amount in euros
 */
const convertCentsToEuros = (cents: number): number => cents / 100;

/**
 * Converts prices in listings from cents to euros
 * @param listings Array of listings with prices in cents
 * @returns Listing[] Array of listings with prices in euros
 */
const convertListingPrices = (listings: Listing[]): Listing[] =>
	listings.map((listing) => ({
		...listing,
		price: convertCentsToEuros(listing.price),
		shippingCost: convertCentsToEuros(listing.shippingCost)
	}));

// Actions
// -------

import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		console.log('Server action triggered');
		try {
			const formData = await request.formData();
			const budget = Number(formData.get('budget'));
			console.log('Received budget:', budget);

			const allListings = await getCpuListings();
			console.log('Fetched all listings');
			const convertedListings = convertListingPrices(allListings);
			const filteredListings = convertedListings.filter((listing) => listing.price <= budget);
			console.log('Filtered listings:', filteredListings);

			return {
				type: 'success',
				status: 200,
				data: JSON.stringify({
					budget,
					Listings: filteredListings,
					allListings: convertedListings
				})
			};
		} catch (error) {
			console.error('Server-side error:', error);
			return {
				error: 'An error occurred while processing your request.'
			};
		}
	}
};

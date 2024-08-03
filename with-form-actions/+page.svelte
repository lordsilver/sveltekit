<script lang="ts">
  import { z } from 'zod';
  import { tick } from 'svelte';
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { enhance } from '$app/forms';
  import type { ActionData } from './$types';

  // Define the Listing interface
  interface Listing {
    id: number;
    name: string;
    supplier?: string;
    price: number;
    shippingCost: number;
    url: string;
  }

  // Define BUDGET_CONFIG locally
  const BUDGET_CONFIG = {
    DEFAULT: 300,
    MIN: 100,
    MAX: 1000,
    STEP: 10
  };

  let budget: number = BUDGET_CONFIG.DEFAULT;
  let allListings: Listing[] = [];
  let displayedListings: Listing[] = [];
  let loading = false;

  // Define the schema for a single listing
  const ListingSchema = z.object({
    id: z.number(),
    name: z.string(),
    supplier: z.string().optional(),
    price: z.number(),
    shippingCost: z.number(),
    url: z.string()
  });

  // Define the schema for the entire response
  const ResponseSchema = z.object({
    type: z.literal('success'),
    status: z.number(),
    data: z.string()
  });

  export let form: ActionData;

  $: if (form?.type === 'success') {
    const parsedData = JSON.parse(form.data);
    allListings = parsedData.allListings || [];
    displayedListings = parsedData.Listings || [];
  }

  $: {
    console.log('Reactive state update:', { 
      budget, 
      allListingsCount: allListings.length,
      displayedListingsCount: displayedListings.length,
      sampleListing: displayedListings[0]
    });
  }
</script>

<div class="flex justify-center items-center min-h-screen py-8">
  <div class="cpu-budgeter-card w-[40rem]">
    <header>
      <h2 class="text-2xl font-bold mb-6 text-center">CPU Budgeter</h2>
    </header>
    <form method="POST" use:enhance>
      <section class="p-4">
        <!-- Budget slider -->
        <RangeSlider name="budget" bind:value={budget} min={BUDGET_CONFIG.MIN} max={BUDGET_CONFIG.MAX} step={BUDGET_CONFIG.STEP} ticked>
          <div class="flex justify-between items-center mt-2">
            <div class="font-bold">Budget</div>
            <div class="text-sm font-mono">€{budget} / €{BUDGET_CONFIG.MAX}</div>
          </div>
        </RangeSlider>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" type="submit">
          Update Listings
        </button>
      </section>
    </form>
    <!-- Display listings or no results message -->
    {#if loading}
      <p>Loading...</p>
    {:else if displayedListings.length > 0}
      <section class="mt-4">
        <h3 class="text-xl font-bold mb-2">Available Listings</h3>
        <div class="table-container">
          <table class="table table-hover">
            <thead>
              <tr>
                <th>Model</th>
                <th>Supplier</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {#each displayedListings as listing}
                <tr>
                  <td>{listing.name}</td>
                  <td>{listing.supplier || 'N/A'}</td>
                  <td>€{listing.price.toFixed(2)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {:else if allListings.length > 0}
      <p class="mt-4 text-center">There are {allListings.length} listings, but none match the current budget.</p>
    {:else}
      <p class="mt-4 text-center">No listings found for the selected budget.</p>
    {/if}
  </div>
</div>

<style>
  .cpu-budgeter-card {
    background-color: rgba(255, 255, 255, 0.1);
    border-radius: 1rem;
    padding: 4rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    min-height: 300px;
  }
</style>

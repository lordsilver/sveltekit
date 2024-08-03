<script lang="ts">
  import { RangeSlider } from '@skeletonlabs/skeleton';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  // Component props
  export let data: PageData;

  // Reactive variables
  let budget = data.budget;
  let listings = data.listings;
  let enhanced = false;
  let loading = false;

  // Progressive enhancement
  onMount(() => {
    enhanced = true;
    const shouldEnableEnhancement = $page.url.searchParams.get('enhanced') === 'false';
    if (shouldEnableEnhancement) {
      $page.url.searchParams.set('enhanced', 'true');
      goto(`?${$page.url.searchParams}`);
    }
  });

  // Form submission handler
  const onSubmit = (event: SubmitEvent) => {
    event.preventDefault();
    loading = true; // Set loading to true when form is submitted
    if (enhanced) {
      // Client-side filtering when enhanced
      listings = data.allListings.filter(listing => listing.price <= budget);
      loading = false;
    } else {
      // Server-side filtering when not enhanced
      goto(`?budget=${budget}&enhanced=${enhanced}`);
    }
  };
</script>

<div class="flex justify-center items-center min-h-screen py-8">
  <div class="cpu-budgeter-card w-[40rem]">
    <header>
      <h2 class="text-2xl font-bold mb-6 text-center">CPU Budgeter</h2>
    </header>
    <form method="get" on:submit={onSubmit}>
      <input type="hidden" name="enhanced" value={enhanced} />
      <section class="p-4">
        <!-- Budget slider -->
        <RangeSlider name="budget" bind:value={budget} min={data.budgetConfig.MIN} max={data.budgetConfig.MAX} step={data.budgetConfig.STEP} ticked>
          <div class="flex justify-between items-center mt-2">
            <div class="font-bold">Budget</div>
            <div class="text-sm font-mono">€{budget.toString().padStart(4, ' ')} / €{data.budgetConfig.MAX}</div>
          </div>
        </RangeSlider>
        <button class="mt-4 px-4 py-2 bg-blue-500 text-white rounded" type="submit">
          Update Listings
        </button>
      </section>
    </form>
    <!-- Display listings or no results message -->
    {#if loading}
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
              {#each Array(5) as _}
                <tr>
                  <td><div class="placeholder animate-pulse h-4 w-32"></div></td>
                  <td><div class="placeholder animate-pulse h-4 w-24"></div></td>
                  <td><div class="placeholder animate-pulse h-4 w-16"></div></td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
    {:else if listings.length > 0}
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
              {#each listings as listing}
                <tr>
                  <td>{listing.name}</td>
                  <td>{listing.supplier}</td>
                  <td>€{listing.price.toFixed(2)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </section>
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

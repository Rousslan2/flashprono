import { loadStripe } from "@stripe/stripe-js";

export default function useCheckout() {
  const checkout = async (sessionId) => {
    const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
    await stripe.redirectToCheckout({ sessionId });
  };

  return { checkout };
}

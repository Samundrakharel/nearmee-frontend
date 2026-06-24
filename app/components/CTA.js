import Link from 'next/link';

export default function CTA() {
  return (
    <section className="cta-section" id="cta">
      <div className="container">
        <h2>Own a Business? List it for Free</h2>
        <p>
          Join thousands of businesses on nearmee and reach more customers in your area.
        </p>
        <Link href="/signup?next=/submit-business">
          <button className="btn-cta" id="btn-create-account">Create Free Account</button>
        </Link>
      </div>
    </section>
  );
}

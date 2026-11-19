import { business } from './data/site'
import Logo from './components/ui/Logo'

export default function LegalPage({ type }) {
  const privacy = type === 'privacy'
  const title = privacy ? 'Privacy Policy' : 'Terms and Conditions'
  return <main className="min-h-screen bg-ink px-5 py-10 text-bone sm:px-8">
    <div className="mx-auto max-w-3xl">
      <a href="/" aria-label="Return to Gentleman Gym home"><Logo /></a>
      <p className="mt-12 text-xs font-semibold uppercase tracking-[0.24em] text-gold">Gentleman Gym · Thellukuzhi</p>
      <h1 className="display mt-4 text-4xl sm:text-6xl">{title}</h1>
      <p className="mt-5 text-sm leading-relaxed text-mist">Last updated: 18 November 2026</p>
      {privacy ? <div className="legal-copy mt-10 space-y-7 text-sm leading-7 text-mist">
        <section><h2>1. Information you provide</h2><p>When you submit the enquiry form, we collect the name, phone number, fitness goal and optional message you enter, together with the date and time of your enquiry. This information is saved in the gym's database so the team can contact you about membership and training. The form also opens WhatsApp with the same enquiry so you can message us directly.</p></section>
        <section><h2>2. How we use it</h2><p>Your details are used only to respond to your enquiry and to keep a record of enquiries received. They are visible to authorised Gentleman Gym staff and are not shown publicly. To limit spam we may also store a one-way hash of your network address, which cannot be turned back into the address.</p></section>
        <section><h2>3. Service providers and third-party services</h2><p>Enquiries are stored using Supabase, a hosted database provider acting on the gym's behalf. When you follow links to WhatsApp, Google Maps, or a telephone link, those services may process information under their own privacy policies.</p></section>
        <section><h2>4. Analytics and cookies</h2><p>This website does not intentionally set analytics or advertising cookies. If analytics, advertising, embedded media, or other tracking services are added in the future, this policy and any required consent controls should be updated before they are enabled.</p></section>
        <section><h2>5. Data security, access and removal</h2><p>Do not send sensitive personal or medical information through the enquiry form. Access to enquiries is limited to signed-in administrators. To ask for your enquiry to be corrected or deleted, contact the gym at {business.phones.map((phone) => phone.display).join(' or ')}.</p></section>
      </div> : <div className="legal-copy mt-10 space-y-7 text-sm leading-7 text-mist">
        <section><h2>1. Website information</h2><p>The website provides general information about Gentleman Gym, its facilities and ways to enquire. Service availability, training arrangements, opening hours and membership fees should be confirmed directly with the gym.</p></section>
        <section><h2>2. No medical advice</h2><p>Website content is for general information and is not medical advice. Consult a qualified healthcare professional before beginning an exercise programme if you have health concerns, injuries, or other relevant conditions.</p></section>
        <section><h2>3. Membership and services</h2><p>Submitting an enquiry does not create a membership or guarantee availability. Membership terms, fees, schedules and any applicable rules must be confirmed with the gym before joining.</p></section>
        <section><h2>4. Third-party links</h2><p>Links to WhatsApp, Google Maps, or other external services are provided for convenience. Gentleman Gym does not control third-party websites or their content.</p></section>
        <section><h2>5. Website availability and contact</h2><p>We aim to keep information useful and up to date, but do not guarantee uninterrupted access or that every detail is always current. Contact the gym directly at {business.phones.map((phone) => phone.display).join(' or ')} to verify information.</p></section>
      </div>}
      <a href="/" className="mt-12 inline-flex border border-gold/50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.16em] text-gold transition-colors hover:bg-gold hover:text-ink">Back to website</a>
    </div>
  </main>
}

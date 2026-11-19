import { Suspense, lazy, useEffect, useState } from 'react'
import About from './components/About'
import Contact from './components/Contact'
import Facilities from './components/Facilities'
import Footer from './components/Footer'
import Hero from './components/Hero'
import LadiesGents from './components/LadiesGents'
import Marquee from './components/Marquee'
import Membership from './components/Membership'
import Navbar from './components/Navbar'
import Trainers from './components/Trainers'
import WhatsAppFloat from './components/ui/WhatsAppFloat'
import WhyChooseUs from './components/WhyChooseUs'
import FAQ from './components/FAQ'
import Gallery from './components/Gallery'
import LegalPage from './LegalPage'
import NotFound from './NotFound'

// The admin panel is a separate chunk so public visitors never download it.
const AdminApp = lazy(() => import('./admin/AdminApp'))

const pageDetails = {
  '/about': { eyebrow: 'Our story', title: 'Built on discipline. Driven by progress.', subtitle: 'Get to know Gentleman Gym and the community behind every rep.' },
  '/facilities': { eyebrow: 'The training floor', title: 'Equipment for every goal.', subtitle: 'Explore the training spaces and equipment available at Gentleman Gym.' },
  '/ladies-gents': { eyebrow: 'Everyone is welcome', title: 'A gym for ladies & gents.', subtitle: 'A welcoming fitness environment for members at every stage.' },
  '/trainer': { eyebrow: 'Personal coaching', title: 'Guidance with purpose.', subtitle: 'Meet the trainer leading the Gentleman Gym fitness journey.' },
  '/gallery': { eyebrow: 'Real effort. Real milestones.', title: 'The Gentleman Gym gallery.', subtitle: 'Competition moments, trophies, and a look inside our gym.' },
  '/membership': { eyebrow: 'Start your journey', title: 'Your next chapter starts here.', subtitle: 'Ask us about membership options and find a routine that works for you.' },
  '/contact': { eyebrow: 'We are easy to reach', title: 'Let’s talk fitness.', subtitle: 'Contact Gentleman Gym for directions, membership enquiries, and visit information.' },
  '/why-us': { eyebrow: 'The Gentleman difference', title: 'Train with confidence.', subtitle: 'A supportive space, focused coaching, and a community built around progress.' },
  '/faq': { eyebrow: 'Need to know', title: 'Frequently asked questions.', subtitle: 'Quick answers before you visit or enquire.' },
}

function PageIntro({ details }) {
  return <section className="page-intro relative overflow-hidden border-b border-white/10 bg-coal pt-36 pb-14 sm:pt-44 sm:pb-20">
    <div className="pointer-events-none absolute -right-16 -top-20 size-72 rounded-full bg-gold/10 blur-3xl" />
    <div className="shell relative">
      <p className="eyebrow">{details.eyebrow}</p>
      <h1 className="display mt-5 max-w-5xl text-4xl leading-[0.98] sm:text-6xl lg:text-7xl">{details.title}</h1>
      <p className="mt-5 max-w-2xl text-sm leading-7 text-mist sm:text-base">{details.subtitle}</p>
      <div className="mt-7 h-px w-24 bg-gold" />
    </div>
  </section>
}

function PageLoader() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timeout = window.setTimeout(() => setVisible(false), reduced ? 80 : 720)
    return () => window.clearTimeout(timeout)
  }, [])
  if (!visible) return null
  return <div className="site-loader" role="status" aria-label="Loading Gentleman Gym">
    <div className="loader-mark"><span>G</span></div>
    <p className="loader-brand">GENTLEMAN <strong>GYM</strong></p>
    <div className="loader-track"><span /></div>
    <span className="sr-only">Loading page…</span>
  </div>
}

export default function App() {
  const [path, setPath] = useState(() => window.location.pathname.replace(/\/$/, '') || '/')

  useEffect(() => {
    const handlePopState = () => {
      setPath(window.location.pathname.replace(/\/$/, '') || '/')
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])

  useEffect(() => {
    const handleAnchorClick = (e) => {
      const anchor = e.target.closest('a')
      if (!anchor) return
      const href = anchor.getAttribute('href')
      if (!href) return

      if (
        anchor.target === '_blank' ||
        anchor.hasAttribute('download') ||
        anchor.getAttribute('rel')?.includes('external') ||
        href.startsWith('http:') ||
        href.startsWith('https:') ||
        href.startsWith('tel:') ||
        href.startsWith('mailto:') ||
        href.startsWith('#') ||
        e.metaKey ||
        e.ctrlKey ||
        e.shiftKey ||
        e.altKey ||
        e.defaultPrevented
      ) {
        return
      }

      if (href.startsWith('/')) {
        e.preventDefault()
        const normalized = href.replace(/\/$/, '') || '/'
        if (window.location.pathname.replace(/\/$/, '') !== (href === '/' ? '' : href.replace(/\/$/, ''))) {
          window.history.pushState({}, '', href)
        }
        setPath(normalized)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    document.addEventListener('click', handleAnchorClick)
    return () => document.removeEventListener('click', handleAnchorClick)
  }, [])

  if (path === '/admin' || path.startsWith('/admin/')) {
    return <Suspense fallback={<div className="min-h-screen bg-ink" role="status" aria-label="Loading admin panel" />}><AdminApp path={path} /></Suspense>
  }
  if (path === '/privacy') return <LegalPage type="privacy" />
  if (path === '/terms') return <LegalPage type="terms" />
  if (path !== '/' && !pageDetails[path]) return <NotFound />

  let content
  if (path === '/') {
    content = <><Hero /><Marquee /><About /><Facilities /><LadiesGents /><Trainers /><Gallery /><WhyChooseUs /><Membership /><FAQ /><Contact /></>
  } else {
    const pageContent = {
      '/about': <About />,
      '/facilities': <Facilities />,
      '/ladies-gents': <LadiesGents />,
      '/trainer': <Trainers />,
      '/gallery': <Gallery />,
      '/membership': <Membership />,
      '/contact': <Contact />,
      '/why-us': <WhyChooseUs />,
      '/faq': <FAQ />,
    }
    content = <><PageIntro details={pageDetails[path]} />{pageContent[path]}</>
  }

  return <>
    <PageLoader key={path} />
    <a href="#main" className="skip-link">Skip to content</a>
    <Navbar currentPath={path} />
    <main id="main">{content}</main>
    <Footer />
    <WhatsAppFloat />
  </>
}

import Hero from '../components/Hero.jsx'
import Marquee from '../components/Marquee.jsx'
import Practice from '../components/Practice.jsx'
import UniverseSection from '../components/UniverseSection.jsx'
import WhyChoose from '../components/WhyChoose.jsx'
import FeaturedAstrology from '../components/FeaturedAstrology.jsx'
import JourneyStrip from '../components/JourneyStrip.jsx'
import Testimonials from '../components/Testimonials.jsx'
import FaqSection from '../components/FaqSection.jsx'

/* Everything lives here except the pages that genuinely need their own route:
   the eight service details, the journey, booking, contact and the policies.
   Testimonials and the FAQ are sections of this page, not destinations. */
export default function Home() {
  return (
    <>
      <Hero />
      <Marquee />
      <Practice />
      <UniverseSection />
      <FeaturedAstrology />
      <WhyChoose />
      <JourneyStrip />
      <Testimonials />
      <FaqSection />
    </>
  )
}

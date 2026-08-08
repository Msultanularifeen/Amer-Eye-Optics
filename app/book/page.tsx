import type { Metadata } from 'next';
import { Calendar } from 'lucide-react';
import { SiteLayout } from '@/components/site-layout';
import { Reveal } from '@/components/reveal';
import { SectionHeading } from '@/components/section-heading';
import { BookingForm } from '@/components/booking-form';
import { getServices, getDoctors } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Book an Appointment',
  description: 'Book your eye examination or consultation at Amir Optical Center. Choose your service, doctor, and preferred time online.',
};

export default async function BookingPage() {
  const [services, doctors] = await Promise.all([getServices(), getDoctors()]);

  return (
    <SiteLayout>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <Reveal>
            <SectionHeading
              eyebrow="Appointment"
              title="Book your eye appointment"
              subtitle="It takes less than two minutes. Choose your service, doctor, and a time that works for you."
            />
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <BookingForm services={services} doctors={doctors} />
      </section>
    </SiteLayout>
  );
}

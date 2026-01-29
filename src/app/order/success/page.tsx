import type { Metadata } from 'next';
import { Container, Section, PageHeader } from '@/components/layout';
import { Button } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Order Confirmed',
  description: 'Your order has been confirmed.',
};

interface SuccessPageProps {
  searchParams: Promise<{ order?: string }>;
}

export default async function OrderSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;
  const orderNumber = params.order;

  return (
    <>
      <PageHeader title="Order Confirmed!" />
      <Section>
        <Container size="sm">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-[#EAD6D6] rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-[#541409]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-[#541409] mb-4">
              Thank You for Your Order!
            </h2>

            {orderNumber && (
              <div className="bg-[#EAD6D6] rounded-lg p-4 mb-6 inline-block">
                <p className="text-sm text-[#541409]/70 mb-1">Order Number</p>
                <p className="text-xl font-mono font-bold text-[#541409]">{orderNumber}</p>
              </div>
            )}

            <div className="max-w-md mx-auto">
              <p className="text-[#EAD6D6] mb-6">
                Your payment has been processed and your pickup slot is confirmed.
                You&apos;ll receive a confirmation email shortly with all the details.
              </p>

              <div className="bg-[#FFF8F0] rounded-xl p-6 mb-8 text-left">
                <h3 className="font-semibold text-[#541409] mb-3">What&apos;s Next?</h3>
                <ul className="space-y-2 text-[#541409]/80 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#541409] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Check your email for a confirmation with pickup details</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-[#541409] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Save your order number for reference</span>
                  </li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button href="/">Back to Home</Button>
                <Button href="/contact" variant="outline">Contact Us</Button>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

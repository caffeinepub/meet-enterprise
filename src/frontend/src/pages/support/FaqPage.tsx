import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';
import { MessageCircle } from 'lucide-react';

const faqs = [
  {
    question: 'How do I track my order?',
    answer: 'You can track your order by visiting the Orders page from your account menu. Each order has a detailed tracking timeline showing its current status.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept UPI, Debit/Credit Cards, Net Banking, and Cash on Delivery (COD) for your convenience.',
  },
  {
    question: 'How long does delivery take?',
    answer: 'Standard delivery typically takes 3-7 business days. You will receive tracking updates via notifications.',
  },
  {
    question: 'Can I cancel my order?',
    answer: 'Yes, you can cancel your order before it is shipped. Visit the order detail page and use the cancel option if available.',
  },
  {
    question: 'What is your return policy?',
    answer: 'We offer a 7-day return policy for most products. Items must be unused and in original packaging. Contact support to initiate a return.',
  },
  {
    question: 'How do I contact customer support?',
    answer: 'You can create a support ticket from the Support page, and our team will respond within 24 hours.',
  },
];

export default function FaqPage() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Need More Help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Can't find what you're looking for? Our support team is here to help.
          </p>
          <Button onClick={() => navigate({ to: '/support/tickets' })} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            Contact Support
          </Button>
        </CardContent>
      </Card>

      <Accordion type="single" collapsible className="space-y-4">
        {faqs.map((faq, index) => (
          <Card key={index}>
            <AccordionItem value={`item-${index}`} className="border-0">
              <AccordionTrigger className="px-6 hover:no-underline">
                <span className="text-left font-semibold">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6 text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </Card>
        ))}
      </Accordion>
    </div>
  );
}

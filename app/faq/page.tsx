import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function FAQPage() {
    return (
        <div className="max-w-3xl mx-auto px-4 py-12">
            <div className="text-center mb-10">
                <h1 className="text-3xl font-bold mb-2">Frequently Asked Questions</h1>
                <p className="text-muted-foreground">
                    Everything you need to know about buying and selling on BidStrike.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>General Questions</CardTitle>
                    <CardDescription>Basics of using the platform</CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>How does bidding work?</AccordionTrigger>
                            <AccordionContent>
                                Bidding is simple. Once you find an item you like, place a bid higher than the current price.
                                We'll notify you if you're outbid using our real-time notification system.
                                If your bid is the highest when the timer ends, you win!
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>Is there a fee to sell items?</AccordionTrigger>
                            <AccordionContent>
                                Listing generally incurs a small platform fee, but currently, listing is free for new users!
                                Additionally, a small percentage of the final sale price is collected as a commission upon successful sale.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>How do I pay for won items?</AccordionTrigger>
                            <AccordionContent>
                                Once an auction ends, the winner will receive checkout instructions.
                                We support major credit cards and secure payment gateways. Payment must be completed within 48 hours.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>Can I retract a bid?</AccordionTrigger>
                            <AccordionContent>
                                Generally, bids are binding contracts and cannot be retracted.
                                In exceptional cases (e.g., obvious typo in bid amount), you may contact support for assistance.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-5">
                            <AccordionTrigger>What happens if the reserve price isn't met?</AccordionTrigger>
                            <AccordionContent>
                                If an auction has a reserve price and bidding ends without reaching it, the item is not sold.
                                The seller may choose to re-list the item at a lower price.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </CardContent>
            </Card>

            <div className="mt-8 text-center text-sm text-muted-foreground">
                Still have questions? <a href="/contact" className="text-primary hover:underline">Contact Support</a>
            </div>
        </div>
    );
}

import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-muted-foreground mb-8">Last updated: December 28, 2024</p>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0 space-y-8">
                    <section>
                        <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            By accessing or using BidStrike, you agree to be bound by these Terms of Service.
                            If you do not agree to these terms, please do not access or use our services.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
                        <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
                            <li>You must be at least 18 years old to use this service.</li>
                            <li>You are responsible for maintaining the confidentiality of your account and password.</li>
                            <li>You agree to accept responsibility for all activities that occur under your account.</li>
                            <li>We reserve the right to refuse service, terminate accounts, or cancel orders at our discretion.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">3. Bidding and Buying</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            By placing a bid, you are entering into a binding contract to purchase the item if you are the winning bidder.
                            You agree to pay the full amount of your winning bid plus any applicable shipping and handling charges.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">4. Selling</h2>
                        <p className="text-muted-foreground leading-relaxed mb-4">
                            Sellers must provide accurate and complete descriptions of items.
                            BidStrike prohibits the sale of counterfeit, illegal, or stolen goods.
                            We reserve the right to remove any listing that violates our policies.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">5. Marketplace Guidelines</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            Users must conduct themselves in a professional and respectful manner.
                            Harassment, hate speech, or fraudulent behavior will result in immediate account termination.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-3">6. Modifications</h2>
                        <p className="text-muted-foreground leading-relaxed">
                            We reserve the right to modify these terms at any time.
                            We will provide notice of significant changes by posting an update on our website.
                        </p>
                    </section>
                </CardContent>
            </Card>

            <div className="mt-12 pt-8 border-t">
                <p className="text-center text-muted-foreground text-sm">
                    Questions about our Terms? <Link href="/contact" className="text-primary hover:underline">Contact Us</Link>
                </p>
            </div>
        </div>
    );
}
